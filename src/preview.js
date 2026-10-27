import './styles.css'

const STORAGE_KEY = 'thunder_lights_v1'

const DEFAULT_ROOMS = [
  { id: 'living', name: '거실', fixture: '메인등', on: true, brightness: 80 },
  { id: 'bedroom', name: '침실', fixture: '천장등', on: false, brightness: 30 },
  { id: 'kitchen', name: '주방', fixture: '싱크등', on: true, brightness: 100 },
  { id: 'study', name: '서재', fixture: '스탠드', on: false, brightness: 60 },
  { id: 'bath', name: '욕실', fixture: '거울등', on: false, brightness: 40 },
]

const SCENES = [
  {
    id: 'all-on',
    name: '모두 켜기',
    detail: '집 안을 모두 밝게',
    apply(list) {
      list.forEach((room) => {
        room.on = true
        room.brightness = 100
      })
    },
  },
  {
    id: 'all-off',
    name: '모두 끄기',
    detail: '집 안을 모두 어둡게',
    apply(list) {
      list.forEach((room) => {
        room.on = false
      })
    },
  },
  {
    id: 'movie',
    name: '영화',
    detail: '거실만 낮게',
    apply(list) {
      list.forEach((room) => {
        room.on = room.id === 'living'
        if (room.id === 'living') room.brightness = 15
      })
    },
  },
  {
    id: 'sleep',
    name: '취침',
    detail: '침실만 은은하게',
    apply(list) {
      list.forEach((room) => {
        room.on = room.id === 'bedroom'
        if (room.id === 'bedroom') room.brightness = 20
      })
    },
  },
  {
    id: 'meal',
    name: '식사',
    detail: '주방과 거실을 밝게',
    apply(list) {
      list.forEach((room) => {
        if (room.id === 'kitchen') {
          room.on = true
          room.brightness = 100
        } else if (room.id === 'living') {
          room.on = true
          room.brightness = 70
        } else {
          room.on = false
        }
      })
    },
  },
  {
    id: 'read',
    name: '독서',
    detail: '서재만 밝게',
    apply(list) {
      list.forEach((room) => {
        room.on = room.id === 'study'
        if (room.id === 'study') room.brightness = 85
      })
    },
  },
]

const PHRASES = [
  {
    via: 'Siri',
    text: '헤이 시리, 썬더로 거실 불 꺼줘',
    run(list) {
      const room = list.find((item) => item.id === 'living')
      room.on = false
      return '거실 불을 껐습니다.'
    },
  },
  {
    via: 'Bixby',
    text: '하이 빅스비, 썬더로 침실 불 30%로 해줘',
    run(list) {
      const room = list.find((item) => item.id === 'bedroom')
      room.on = true
      room.brightness = 30
      return '침실을 30%로 켰습니다.'
    },
  },
  {
    via: 'Siri',
    text: '헤이 시리, 썬더로 주방 불 켜줘',
    run(list) {
      const room = list.find((item) => item.id === 'kitchen')
      room.on = true
      room.brightness = 100
      return '주방 불을 켰습니다.'
    },
  },
  {
    via: 'Bixby',
    text: '하이 빅스비, 썬더로 취침 모드 켜줘',
    scene: 'sleep',
    run(list) {
      SCENES.find((scene) => scene.id === 'sleep').apply(list)
      return '취침 장면을 적용했습니다.'
    },
  },
]

const titles = { home: '우리 집', scenes: '장면', voice: '음성' }

function clamp(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 80
  return Math.min(100, Math.max(1, Math.round(number)))
}

function loadRooms() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')
    if (!Array.isArray(saved)) return DEFAULT_ROOMS.map((room) => ({ ...room }))
    return DEFAULT_ROOMS.map((room) => {
      const found = saved.find((item) => item && item.id === room.id)
      if (!found) return { ...room }
      return { ...room, on: Boolean(found.on), brightness: clamp(found.brightness) }
    })
  } catch {
    return DEFAULT_ROOMS.map((room) => ({ ...room }))
  }
}

const rooms = loadRooms()
let sceneId = null
let tab = 'home'
let notice = ''

const body = document.querySelector('#app-body')
const title = document.querySelector('#screen-title')
const live = document.querySelector('#live')

function persist() {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(rooms.map((room) => ({ id: room.id, on: room.on, brightness: room.brightness }))),
  )
}

function render() {
  title.textContent = titles[tab]
  live.textContent = notice
  body.replaceChildren()
  if (tab === 'home') renderHome()
  else if (tab === 'scenes') renderScenes()
  else renderVoice()
}

function renderHome() {
  const onRooms = rooms.filter((room) => room.on)
  const summary = document.createElement('section')
  summary.className = 'summary'
  const label = document.createElement('p')
  label.textContent = '켜진 곳'
  const count = document.createElement('strong')
  count.textContent = String(onRooms.length)
  const names = document.createElement('span')
  names.textContent = onRooms.length ? onRooms.map((room) => room.name).join(' · ') : '모두 꺼져 있습니다'
  summary.append(label, count, names)
  body.append(summary)

  rooms.forEach((room) => body.append(roomCard(room)))

  const note = document.createElement('p')
  note.className = 'phone-note'
  note.textContent = '이 탭을 닫으면 사라집니다. 계정, 결제, 서버는 없습니다.'
  body.append(note)
}

function roomCard(room) {
  const card = document.createElement('section')
  card.className = 'room' + (room.on ? ' is-on' : '')

  const head = document.createElement('div')
  head.className = 'room-head'
  const dot = document.createElement('span')
  dot.className = 'dot'
  dot.setAttribute('aria-hidden', 'true')
  const text = document.createElement('div')
  text.className = 'room-copy'
  const name = document.createElement('strong')
  name.textContent = room.name
  const status = document.createElement('small')
  status.textContent = room.on ? `${room.fixture} · ${room.brightness}%` : `${room.fixture} · 꺼짐`
  text.append(name, status)

  const toggle = document.createElement('button')
  toggle.type = 'button'
  toggle.className = 'switch' + (room.on ? ' is-on' : '')
  toggle.setAttribute('role', 'switch')
  toggle.setAttribute('aria-checked', room.on ? 'true' : 'false')
  toggle.setAttribute('aria-label', `${room.name} ${room.on ? '끄기' : '켜기'}`)
  toggle.addEventListener('click', () => {
    room.on = !room.on
    sceneId = null
    notice = room.on ? `${room.name} 불을 켰습니다.` : `${room.name} 불을 껐습니다.`
    persist()
    render()
  })

  head.append(dot, text, toggle)
  card.append(head)

  if (room.on) {
    const row = document.createElement('label')
    row.className = 'bright'
    const caption = document.createElement('span')
    caption.textContent = '밝기'
    const slider = document.createElement('input')
    slider.type = 'range'
    slider.min = '1'
    slider.max = '100'
    slider.value = String(room.brightness)
    slider.setAttribute('aria-label', `${room.name} 밝기`)
    const value = document.createElement('span')
    value.className = 'bright-value'
    value.textContent = `${room.brightness}%`
    slider.addEventListener('input', () => {
      room.brightness = clamp(slider.value)
      sceneId = null
      notice = ''
      live.textContent = ''
      value.textContent = `${room.brightness}%`
      status.textContent = `${room.fixture} · ${room.brightness}%`
      persist()
    })
    row.append(caption, slider, value)
    card.append(row)
  }

  return card
}

function renderScenes() {
  const intro = document.createElement('p')
  intro.className = 'panel-copy'
  intro.textContent = '장면을 누르면 집 안 불이 한 번에 바뀝니다.'
  body.append(intro)

  SCENES.forEach((scene) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'scene' + (sceneId === scene.id ? ' is-on' : '')
    const name = document.createElement('strong')
    name.textContent = scene.name
    const detail = document.createElement('small')
    detail.textContent = sceneId === scene.id ? '적용됨 · ' + scene.detail : scene.detail
    button.append(name, detail)
    button.addEventListener('click', () => {
      scene.apply(rooms)
      sceneId = scene.id
      notice = `${scene.name} 장면을 적용했습니다.`
      persist()
      render()
    })
    body.append(button)
  })
}

function renderVoice() {
  const call = document.createElement('section')
  call.className = 'summary'
  const label = document.createElement('p')
  label.textContent = '호출 이름'
  const strong = document.createElement('strong')
  strong.textContent = '썬더'
  const info = document.createElement('span')
  info.textContent = '시리 단축어와 빅스비 앱 액션으로 연결됩니다. 앱이 마이크를 켜 두고 듣지 않습니다.'
  call.append(label, strong, info)
  body.append(call)

  const hint = document.createElement('p')
  hint.className = 'panel-copy'
  hint.textContent = '예시를 누르면 이 미리보기의 조명이 바뀝니다. 마이크는 쓰지 않습니다.'
  body.append(hint)

  PHRASES.forEach((phrase) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'phrase'
    const via = document.createElement('span')
    via.textContent = phrase.via
    const text = document.createElement('strong')
    text.textContent = phrase.text
    button.append(via, text)
    button.addEventListener('click', () => {
      const message = phrase.run(rooms)
      sceneId = phrase.scene || null
      notice = message
      persist()
      render()
    })
    body.append(button)
  })

  const links = document.createElement('div')
  links.className = 'settings'
  const home = document.createElement('a')
  home.href = import.meta.env.BASE_URL
  home.textContent = 'Thunder 홈'
  const esa = document.createElement('a')
  esa.href = 'https://jadegun1124.github.io/esa/'
  esa.textContent = 'ESA 홈'
  links.append(home, esa)
  body.append(links)
}

document.querySelectorAll('.tabbar button').forEach((button) => {
  button.addEventListener('click', () => {
    tab = button.dataset.tab
    notice = ''
    document.querySelectorAll('.tabbar button').forEach((item) => {
      const active = item === button
      item.classList.toggle('is-active', active)
      if (active) item.setAttribute('aria-current', 'page')
      else item.removeAttribute('aria-current')
    })
    render()
  })
})

render()
