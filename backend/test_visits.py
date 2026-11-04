"""Local integration checks; synthetic visit records are never copied to production."""
import subprocess,urllib.request,urllib.error,time,json,secrets,uuid,sqlite3,pathlib,hashlib,os
base='http://127.0.0.1:8787';opener=urllib.request.build_opener(urllib.request.ProxyHandler({}));conn=None
for f in pathlib.Path('.wrangler/state').glob('**/*.sqlite'):
 c=sqlite3.connect(f)
 if c.execute("SELECT name FROM sqlite_master WHERE name='admin_sessions'").fetchone():conn=c;break
 c.close()
assert conn
uid='visit-test-'+secrets.token_hex(5);token=secrets.token_hex(32);cookie='oculix_admin='+token
conn.execute('INSERT INTO admin_sessions(token_hash,user_id,expires_at) VALUES(?,?,?)',(hashlib.sha256(token.encode()).hexdigest(),uid,int(time.time()*1000)+600000));conn.commit()
p=subprocess.Popen(['node','--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','dev','--config','dist/server/wrangler.json','--local','--persist-to','.wrangler/state','--ip','127.0.0.1','--port','8787','--inspector-port','0'],stdout=open(os.environ.get('TEST_LOG', '/tmp/oculix-visits-test.log'),'w'),stderr=subprocess.STDOUT)
def req(path,method='GET',data=None,cookies='',identity='',origin=True,ua='Mozilla/5.0'):
 h={'User-Agent':ua}
 if origin:h['Origin']=base
 if cookies:h['Cookie']=cookies
 if identity:h.update({'oai-authenticated-user-id':uid,'oai-authenticated-user-email':identity})
 if data is not None:h['Content-Type']='application/json'
 try:
  with opener.open(urllib.request.Request(base+path,method=method,data=json.dumps(data).encode() if data is not None else None,headers=h),timeout=30) as r:return r.status,r.read(),r.headers
 except urllib.error.HTTPError as e:return e.code,e.read(),e.headers
owner='oculixofficial@gmail.com'
def metrics():
 status,b,h=req('/api/visits',cookies=cookie,identity=owner);assert status==200,(status,b);return json.loads(b)
ids=[]
try:
 for i in range(100):
  try:req('/education');break
  except urllib.error.URLError:time.sleep(.2)
 else:raise RuntimeError('Runtime unavailable')
 code,b,h=req('/education');assert code==200 and b'Coming soon' in b and b'Online courses' in b and b'Webinars' in b
 assert req('/api/visits')[0]==403
 assert req('/api/visits',cookies=cookie,identity='ramesh547747@gmail.com')[0]==403
 before=metrics();a=str(uuid.uuid4());ids.append(a)
 assert req('/api/visits','POST',{'id':a,'path':'/'},origin=False)[0]==403
 status,b,h=req('/api/visits','POST',{'id':a,'path':'/'});assert status==204
 visit_cookie=h.get('Set-Cookie').split(';')[0]
 assert req('/api/visits','POST',{'id':a,'path':'/'},cookies=visit_cookie)[0]==204
 after=metrics();assert after['total']['pageviews']==before['total']['pageviews']+1 and after['total']['visits']==before['total']['visits']+1
 b=str(uuid.uuid4());ids.append(b);assert req('/api/visits','POST',{'id':b,'path':'/education'},cookies=visit_cookie)[0]==204
 after=metrics();assert after['total']['pageviews']==before['total']['pageviews']+2 and after['total']['visits']==before['total']['visits']+1 and len(after['daily'])==7
 assert req('/api/visits','POST',{'id':str(uuid.uuid4()),'path':'/admin'})[0]==400
 assert req('/api/visits','POST',{'id':str(uuid.uuid4()),'path':'/'},ua='Googlebot')[0]==204
 assert metrics()['total']['pageviews']==after['total']['pageviews']
 assert req('/api/content','POST',{'key':'humatrix_video','value':'http://example.com/video.mp4'},cookies=cookie,identity=owner)[0]==400
 assert req('/products/humatrix')[0]==200
 print('PASS: Education page; protected counts; duplicate-event handling; same-session page views; seven-day totals; admin-page and bot exclusions; insecure video URL rejected.')
finally:
 p.terminate()
 try:p.wait(timeout=5)
 except:p.kill()
 conn.execute('DELETE FROM admin_sessions WHERE user_id=?',(uid,))
 for event in ids:conn.execute('DELETE FROM visits WHERE id=?',(event,))
 conn.commit();conn.close()
