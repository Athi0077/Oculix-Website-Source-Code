"""Isolated local Worker integration checks. No synthetic data is sent to production."""
import json,sqlite3,pathlib,subprocess,urllib.request,urllib.error,time,secrets,hashlib,os
_base_dir = pathlib.Path(__file__).resolve().parent
_course_path = _base_dir / 'src/services/odyssey/course.json' if (_base_dir / 'src/services/odyssey/course.json').exists() else _base_dir / 'lib/odyssey/course.json'
course=json.load(open(_course_path));lessons=[l for u in course['units'] for l in u['lessons']]
assert len(course['units'])==10 and len(lessons)==60
questions=[q for l in lessons for q in l['questions']]
assert len(questions)==600 and len({q['id'] for q in questions})==600
assert all(len(l['questions'])==10 for l in lessons)
assert all(len(q['options'])==4 and len(set(q['options']))==4 and q['answer'] in range(4) for q in questions if q['type']=='choice')
lookup={q['id']:q for q in questions}
def answer(q):return q['answer'] if q['type']=='choice' else list(range(len(q['pairs'] if q['type']=='match' else q['items'])))
conn=None
for f in pathlib.Path('.wrangler/state').glob('**/*.sqlite'):
 c=sqlite3.connect(f)
 if c.execute("SELECT name FROM sqlite_master WHERE name='odyssey_progress'").fetchone():conn=c;break
 c.close()
assert conn,'Apply the local migrations first'
suffix=secrets.token_hex(5);adminid='odyssey-admin-'+suffix;uid='odyssey-learner-'+suffix;other='odyssey-other-'+suffix;email='odyssey-'+suffix+'@example.com';token=secrets.token_hex(32);cookie='oculix_admin='+token
conn.execute('INSERT INTO admin_sessions(token_hash,user_id,expires_at) VALUES(?,?,?)',(hashlib.sha256(token.encode()).hexdigest(),adminid,int(time.time()*1000)+600000));conn.commit()
base='http://127.0.0.1:8792';opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
_log_path = os.environ.get('TEST_LOG', '/tmp/oculix-odyssey-test.log')
log=open(_log_path,'w');p=subprocess.Popen(['node','--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','dev','--config','dist/server/wrangler.json','--local','--persist-to','.wrangler/state','--ip','127.0.0.1','--port','8792','--inspector-port','0'],stdout=log,stderr=subprocess.STDOUT)
def req(path='/api/odyssey',data=None,who='student',origin=None):
 h={}
 if who=='admin':h.update({'oai-authenticated-user-id':adminid,'oai-authenticated-user-email':'oculixofficial@gmail.com','Cookie':cookie})
 elif who=='student':h.update({'oai-authenticated-user-id':uid,'oai-authenticated-user-email':email})
 elif who=='other':h.update({'oai-authenticated-user-id':other,'oai-authenticated-user-email':'other-'+email})
 if data is not None:h.update({'Content-Type':'application/json','Origin':origin or base})
 try:
  with opener.open(urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,headers=h),timeout=45) as r:status,raw,headers=r.status,r.read(),r.headers
 except urllib.error.HTTPError as e:status,raw,headers=e.code,e.read(),e.headers
 try:body=json.loads(raw)
 except:body=raw.decode()
 return status,body,headers

def post(action,**kw):
 status,b,h=req(data={'action':action,**kw});assert status==200,(action,status,b);return b
try:
 for i in range(100):
  try:
   if req('/education',who='anonymous')[0]==200:break
  except urllib.error.URLError:time.sleep(.2)
 else:raise RuntimeError(f'Local Worker unavailable; see {_log_path}')
 status,html,_=req('/education/ai-odyssey',who='anonymous');assert status==200 and '₹199' in html and '600' in html and 'Sign in to pay' in html and 'activated after' in html
 assert req(who='anonymous')[0]==401
 assert req('/api/odyssey?action=lesson&id=u1-l1')[0]==403
 status,html,h=req('/education/ai-odyssey');assert status==200 and 'Use your learning account email' in html and email in html and 'does not unlock the course automatically' in html
 assert req('/api/odyssey?action=admin')[0]==403
 assert req(data={'action':'grant','email':email})[0]==403
 assert req(data={'action':'grant','email':email},who='admin',origin='https://untrusted.example')[0]==403
 status,b,h=req(who='admin');assert status==200 and b['allowed'] and b['isAdmin'] and b['paymentsEnabled']==True and b['automaticEnrolment']==False
 assert req('/api/odyssey?action=lesson&id=u10-l6',who='admin')[0]==200
 assert req(data={'action':'grant','email':email},who='admin')[0]==200
 assert req('/api/odyssey?action=lesson&id=u2-l1')[0]==403
 assert req(data={'action':'startExam'})[0]==403
 l=lessons[0];a=[answer(q) for q in l['questions']]
 wrong=list(a)
 for i in [0,1,2]:wrong[i]=(l['questions'][i]['answer']+1)%4
 b=post('submitLesson',lessonId=l['id'],answers=wrong);assert b['score']==7 and not b['passed']
 assert req('/api/odyssey?action=lesson&id=u2-l1')[0]==403
 assert req(data={'action':'submitLesson','lessonId':l['id'],'answers':[None]*10})[0]==400
 for l in lessons:
  status,b,h=req('/api/odyssey?action=lesson&id='+l['id']);assert status==200,(l['id'],status,b)
  assert all('answer' not in q and 'explanation' not in q for q in b['lesson']['questions'])
  a=[answer(q) for q in l['questions']]
  if l['id']=='u1-l1':
   b=post('checkQuestion',lessonId=l['id'],questionId=l['questions'][0]['id'],answer=a[0]);assert b['correct'] and b['explanation']
  b=post('submitLesson',lessonId=l['id'],answers=a);assert b['passed'] and b['score']==10,(l['id'],b)
 status,b,h=req();assert sum(p['best_score']>=8 for p in b['progress'])==60 and b['certificate']==None
 assert req(data={'action':'issueCertificate','name':'QA Learner'})[0]==403
 exam=post('startExam');assert len(exam['questions'])==25 and len({q['id'] for q in exam['questions']})==25
 assert len({q['id'].split('-')[0] for q in exam['questions']})==10
 assert all('answer' not in q and 'explanation' not in q for q in exam['questions'])
 a=[answer(lookup[q['id']]) for q in exam['questions']]
 for i in range(8):a[i]=(a[i]+1)%4
 b=post('submitExam',examId=exam['id'],answers=a,name='QA Learner');assert b['score']==17 and not b['passed']
 assert req(data={'action':'issueCertificate','name':'QA Learner'})[0]==403
 expired=post('startExam');conn.execute('UPDATE odyssey_exams SET expires_at=0 WHERE id=?',(expired['id'],));conn.commit()
 assert req('/api/odyssey?action=exam&id='+expired['id'])[0]==409
 assert req(data={'action':'submitExam','examId':expired['id'],'answers':[0]*25,'name':'QA Learner'})[0]==409
 exam=post('startExam');a=[answer(lookup[q['id']]) for q in exam['questions']]
 assert req(data={'action':'submitExam','examId':exam['id'],'answers':a,'name':'Other'},who='other')[0]==403
 b=post('submitExam',examId=exam['id'],answers=a,name='QA Learner');assert b['passed'] and b['score']==25 and b['certificate']['id']
 certid=b['certificate']['id']
 assert req(data={'action':'submitExam','examId':exam['id'],'answers':a,'name':'QA Learner'})[0]==409
 status,html,h=req('/education/ai-odyssey/certificate');assert status==200 and 'QA Learner' in html and certid in html and 'Save as PDF' in html
 status,html,h=req('/education/ai-odyssey/verify?id='+certid,who='anonymous');assert status==200 and 'Certificate verified.' in html and 'QA Learner' in html
 status,html,h=req('/education/ai-odyssey/certificate',who='other');assert 'QA Learner' not in html
 post('issueCertificate',name='A different name');assert conn.execute('SELECT COUNT(*) FROM odyssey_certificates WHERE user_id=?',(uid,)).fetchone()[0]==1
 assert req(data={'action':'revoke','email':email},who='admin')[0]==200
 assert req('/api/odyssey?action=lesson&id=u1-l1')[0]==403
 print('PASS: 10 units / 60 subtopics / 600 questions; hidden answer keys; admin free access; enrolment and unit gates; server grading; saved best scores; all-unit exam sampling; expiry and replay protection; completion certificate and public verification; revocation.')
finally:
 p.terminate()
 try:p.wait(timeout=8)
 except:p.kill();p.wait()
 for table in ['odyssey_progress','odyssey_exams','odyssey_certificates']:conn.execute('DELETE FROM '+table+' WHERE user_id IN (?,?,?)',(uid,other,adminid))
 conn.execute('DELETE FROM odyssey_enrolments WHERE email=?',(email,));conn.execute('DELETE FROM admin_sessions WHERE user_id=?',(adminid,));conn.commit();conn.close();log.close()
