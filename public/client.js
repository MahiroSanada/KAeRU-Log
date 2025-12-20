const socket = io();
let myName = localStorage.getItem('chat_username') || '';
document.getElementById('usernameTag').textContent = myName;

const el = {
  connDot: document.getElementById('connDot'),
  connText: document.getElementById('connText'),
  messages: document.getElementById('messages'),
  input: document.getElementById('messageInput'),
  send: document.getElementById('sendBtn'),
  toast: document.getElementById('toast'),
  userModal: document.getElementById('userModal'),
  userOpen: document.getElementById('editUser'),
  userSave: document.getElementById('userSave'),
  userCancel: document.getElementById('userCancel'),
  usernameInput: document.getElementById('username'),
  deleteModal: document.getElementById('deleteModal'),
  deleteConfirm: document.getElementById('deleteConfirm'),
  deleteCancel: document.getElementById('deleteCancel'),
};

let messages = [];
let deleteTargetId = null;

function showToast(msg, ms = 1500){
  el.toast.textContent = msg;
  el.toast.classList.add('show');
  setTimeout(()=> el.toast.classList.remove('show'), ms);
}

function renderMessage(msg){
  const wrap = document.createElement('div');
  wrap.className = 'msg' + (msg.self?' self':'');
  wrap.dataset.id = msg.id;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = (msg.username||'?').slice(0,2).toUpperCase();

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  const meta = document.createElement('div');
  meta.className = 'meta';
  const nameEl = document.createElement('span');
  nameEl.className = 'name';
  nameEl.textContent = msg.username;
  meta.appendChild(nameEl);

  const textEl = document.createElement('div');
  textEl.className = 'text';
  textEl.textContent = msg.message;

  const delBtn = document.createElement('button');
  delBtn.className = 'btn danger';
  delBtn.textContent = '削除';
  delBtn.addEventListener('click', ()=>{
    deleteTargetId = msg.id;
    el.deleteModal.classList.add('show');
  });

  bubble.append(meta, textEl, delBtn);
  wrap.append(avatar, bubble);
  return wrap;
}

function renderAll(){
  el.messages.innerHTML = '';
  messages.forEach(m => el.messages.appendChild(renderMessage(m)));
}

socket.on('connect', ()=>{
  el.connDot.classList.replace('offline','online');
  el.connText.textContent = 'オンライン';
});

socket.on('disconnect', ()=>{
  el.connDot.classList.replace('online','offline');
  el.connText.textContent = '切断';
});

socket.on('messages', data=>{
  messages = data.map(m => ({...m, self:m.username===myName}));
  renderAll();
});

socket.on('message', msg=>{
  msg.self = msg.username===myName;
  messages.push(msg);
  el.messages.appendChild(renderMessage(msg));
});

socket.on('deleteMessage', id=>{
  messages = messages.filter(m=>m.id!==id);
  renderAll();
});

el.send.addEventListener('click', ()=>{
  const text = el.input.value.trim();
  if(!text) return;
  if(!myName){ el.userModal.classList.add('show'); return; }
  socket.emit('message', { username: myName, message: text });
  el.input.value = '';
});

el.userOpen.addEventListener('click', ()=>{
  el.usernameInput.value = myName;
  el.userModal.classList.add('show');
});
el.userCancel.addEventListener('click', ()=> el.userModal.classList.remove('show'));
el.userSave.addEventListener('click', ()=>{
  const name = el.usernameInput.value.trim();
  if(!name) return showToast('名前を入力してください');
  myName = name;
  localStorage.setItem('chat_username', name);
  document.getElementById('usernameTag').textContent = myName;
  el.userModal.classList.remove('show');
});

el.deleteCancel.addEventListener('click', ()=> el.deleteModal.classList.remove('show'));
el.deleteConfirm.addEventListener('click', ()=>{
  if(deleteTargetId!==null){
    socket.emit('deleteMessage', deleteTargetId);
    deleteTargetId = null;
    el.deleteModal.classList.remove('show');
  }
});
