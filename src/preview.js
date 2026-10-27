import './styles.css'

const STORAGE_KEY = 'thunder_preview_v1'
const ITEMS = [
  { id: 'umbrella', title: '우산 챙기기', note: '오후에 비가 옵니다' },
  { id: 'meeting', title: '2시 회의', note: '회의실 B' },
  { id: 'walk', title: '퇴근길 10분', note: '집에 가기 전 한 바퀴' },
]

const titles = { home: '오늘', log: '기록', settings: '설정' }

function loadDone() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

const done = loadDone()
let tab = 'home'

const body = document.querySelector('#app-body')
const title = document.querySelector('#screen-title')

function persist() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...done]))
}

function taskButton(item) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'task' + (done.has(item.id) ? ' is-done' : '')
  const mark = document.createElement('span')
  mark.className = 'check'
  const text = document.createElement('span')
  text.textContent = item.title
  const note = document.createElement('small')
  note.textContent = item.note
  text.append(note)
  button.append(mark, text)
  button.addEventListener('click', () => {
    if (done.has(item.id)) done.delete(item.id)
    else done.add(item.id)
    persist()
    render()
  })
  return button
}

function render() {
  title.textContent = titles[tab]
  body.replaceChildren()
  if (tab === 'home') {
    ITEMS.forEach((item) => body.append(taskButton(item)))
    const note = document.createElement('p')
    note.className = 'phone-note'
    note.textContent = '예시입니다. 체크는 이 탭을 닫으면 사라지며 서버로 보내지 않습니다.'
    body.append(note)
    return
  }
  if (tab === 'log') {
    const finished = ITEMS.filter((item) => done.has(item.id))
    if (finished.length === 0) {
      const empty = document.createElement('p')
      empty.className = 'empty'
      empty.textContent = '아직 해낸 일이 없습니다. 홈에서 체크하면 여기에 쌓입니다.'
      body.append(empty)
      return
    }
    finished.forEach((item) => body.append(taskButton(item)))
    return
  }
  const wrap = document.createElement('div')
  wrap.className = 'settings'
  const info = document.createElement('p')
  info.textContent = '이 화면은 Thunder 회사 사이트 안의 미리보기입니다. 로그인, 알림, 결제, 서버 저장은 없습니다.'
  const home = document.createElement('a')
  home.href = import.meta.env.BASE_URL
  home.textContent = '회사 홈으로'
  const esa = document.createElement('a')
  esa.href = 'https://jadegun1124.github.io/esa/'
  esa.textContent = 'ESA 홈으로'
  wrap.append(info, home, esa)
  body.append(wrap)
}

document.querySelectorAll('.tabbar button').forEach((button) => {
  button.addEventListener('click', () => {
    tab = button.dataset.tab
    document.querySelectorAll('.tabbar button').forEach((item) => {
      item.classList.toggle('is-active', item === button)
    })
    render()
  })
})

render()
