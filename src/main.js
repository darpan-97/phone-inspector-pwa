import { parsePhoneNumberFromString, AsYouType } from 'libphonenumber-js/max'
import './style.css'

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => console.log('SW registered', reg))
      .catch(err => console.error('SW registration failed', err))
  })
}

const elRegion = document.getElementById('region')
const elInput = document.getElementById('input')
const elAnalyze = document.getElementById('analyze')
const elResults = document.getElementById('results')
const elError = document.getElementById('error-msg')
const elCurrentHome = document.getElementById('current-home')
const elDetailsBtn = document.getElementById('details-btn')
const elSidePanel = document.getElementById('side-panel')
const elClosePanel = document.getElementById('close-panel')
const elVerboseList = document.getElementById('verbose-output')
const elOverlay = document.querySelector('.panel-overlay')

// Intel links
const intelIPQS = document.getElementById('intel-ipqs')
const intelWhoCalled = document.getElementById('intel-whocalled')
const intelSkip = document.getElementById('intel-skip')

// OSINT Buttons
const dorkGlobal = document.getElementById('dork-global')
const dorkSocial = document.getElementById('dork-social')
const dorkDocs = document.getElementById('dork-docs')
const dorkCommunity = document.getElementById('dork-community')
const dorkLeak = document.getElementById('dork-leak')

// Result elements
const resCountry = document.getElementById('res-country')
const resCode = document.getElementById('res-code')
const resNational = document.getElementById('res-national')
const resType = document.getElementById('res-type')
const resInternational = document.getElementById('res-international')
const valBadge = document.getElementById('validity-badge')
const valText = document.getElementById('validity-text')
const callBtn = document.getElementById('call-btn')
const waBtn = document.getElementById('wa-btn')
const shareBtn = document.getElementById('share-btn')

let currentPhone = null

// Detect user's home country
function getHomeCountry() {
  const saved = localStorage.getItem('home-country')
  if (saved) return saved
  try {
    const locale = navigator.language || 'en-IE'
    const parts = locale.split('-')
    if (parts.length > 1) return parts[1].toUpperCase()
    if (locale.length === 2) return locale.toUpperCase()
  } catch (e) { }
  return 'IE'
}

let homeCountry = getHomeCountry()
if (elCurrentHome) elCurrentHome.textContent = homeCountry

const TYPE_LABELS = {
  'MOBILE': '📱 Mobile',
  'FIXED_LINE': '☎️ Fixed Line',
  'FIXED_LINE_OR_MOBILE': '📲 Fixed/Mobile',
  'TOLL_FREE': '🆓 Toll Free',
  'PREMIUM_RATE': '💎 Premium',
  'SHARED_COST': '💰 Shared Cost',
  'VOIP': '🌐 VoIP',
  'PERSONAL_NUMBER': '👤 Personal',
  'PAGER': '📟 Pager',
  'UAN': '🏢 UAN',
  'VOICEMAIL': '✉️ Voicemail'
}

const EXPLANATIONS = {
  isValid: "A comprehensive check against the numbering plan of the detected country.",
  isPossible: "Verifies if the number length is mathematically possible for this country.",
  e164: "The global E.164 standard. Format required by WhatsApp, Twilio, and most APIs.",
  type: "Identified by analyzing leading digits against the country's national registry.",
  uri: "The 'tel:' protocol used to trigger your phone's native dialer.",
  national: "The standard format used when calling locally from within the same country."
}

function renderVerbose(phone) {
  const data = [
    { key: 'Validation (Full)', val: phone.isValid() ? 'Passed ✅' : 'Failed ❌', explain: EXPLANATIONS.isValid },
    { key: 'Math Possible', val: phone.isPossible() ? 'Yes' : 'No', explain: EXPLANATIONS.isPossible },
    { key: 'Detected Type', val: TYPE_LABELS[phone.getType()] || 'Unknown', explain: EXPLANATIONS.type },
    { key: 'E.164 Standard', val: phone.number, explain: EXPLANATIONS.e164 },
    { key: 'National Format', val: phone.formatNational(), explain: EXPLANATIONS.national },
    { key: 'System URI', val: phone.getURI(), explain: EXPLANATIONS.uri }
  ]

  elVerboseList.innerHTML = data.map(item => `
    <div class="verbose-item">
      <span class="key">${item.key}</span>
      <span class="val">${item.val}</span>
      <span class="explain">${item.explain}</span>
    </div>
  `).join('')
}

// OSINT Dork Generation Logic
function generateGoogleDork(phone, type) {
  const intl = phone.number;
  const intlNoPlus = intl.replace('+', '');
  const nationalRaw = phone.nationalNumber;
  const nationalZero = `0${nationalRaw}`;

  const formats = [
    `"${intl}"`,
    `"${intlNoPlus}"`,
    `"${nationalZero}"`,
    `"${phone.formatInternational()}"`,
    `"${phone.formatNational()}"`
  ];

  const baseQuery = `(${formats.join(' OR ')})`;
  let finalQuery = '';

  switch (type) {
    case 'global':
      finalQuery = baseQuery;
      break;
    case 'social':
      finalQuery = `${baseQuery} (site:facebook.com OR site:linkedin.com OR site:instagram.com OR site:twitter.com OR site:tiktok.com OR site:pinterest.com)`;
      break;
    case 'docs':
      finalQuery = `${baseQuery} (filetype:pdf OR filetype:doc OR filetype:docx OR filetype:xls OR filetype:xlsx OR filetype:txt)`;
      break;
    case 'community':
      finalQuery = `${baseQuery} (site:reddit.com OR site:800notes.com OR site:whocallsme.com OR site:tellows.com OR site:spamcalls.net OR site:quora.com)`;
      break;
    case 'leak':
      finalQuery = `${baseQuery} (site:pastebin.com OR site:github.com OR site:ghostbin.com OR site:controlc.com OR site:trello.com)`;
      break;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(finalQuery)}`;
}

function updateUI(phone) {
  currentPhone = phone
  renderVerbose(phone)

  elError.classList.add('hidden')
  elResults.classList.remove('hidden')

  const isValid = phone.isValid()
  valBadge.className = `status-badge ${isValid ? 'valid' : 'invalid'}`

  let validityMsg = isValid ? 'Valid Number' : (phone.isPossible() ? 'Invalid (Wrong Prefix)' : 'Invalid (Wrong Length)')
  if (!elRegion.value && !elInput.value.startsWith('+')) {
    const detectedCountry = phone.country || homeCountry
    validityMsg += ` [Auto-Context: ${detectedCountry}]`
  }
  valText.textContent = validityMsg

  resCountry.textContent = phone.country || 'Global'
  resCode.textContent = `+${phone.countryCallingCode}`
  resNational.textContent = phone.nationalNumber

  const rawType = phone.getType()
  resType.textContent = TYPE_LABELS[rawType] || rawType || 'Unknown'

  resInternational.textContent = phone.formatInternational()

  // High-level actions
  callBtn.href = `tel:${phone.number}`
  waBtn.href = `https://wa.me/${phone.number.replace('+', '').split('ext')[0].trim()}`

  // Intelligence Deep Links
  const isoCode = (phone.country || homeCountry).toLowerCase();
  const nationalNum = phone.nationalNumber;
  const fullDigitsNoPlus = phone.number.replace('+', '');

  // 1. IPQualityScore: GLOBAL path is most stable for direct links
  intelIPQS.href = `https://www.ipqualityscore.com/free-phone-number-lookup/lookup/GLOBAL/${fullDigitsNoPlus}`

  // 2. Free-Lookup: Strictly requires NO PLUS sign
  intelWhoCalled.href = `https://free-lookup.net/${fullDigitsNoPlus}`
  intelSkip.href = `https://www.truecaller.com/search/${isoCode}/${nationalNum}`

  elResults.style.animation = 'none'
  elResults.offsetHeight
  elResults.style.animation = 'slideUp 0.5s ease-out'
}

// OSINT Click Handlers
dorkGlobal.addEventListener('click', () => {
  if (currentPhone) window.open(generateGoogleDork(currentPhone, 'global'), '_blank');
});
dorkSocial.addEventListener('click', () => {
  if (currentPhone) window.open(generateGoogleDork(currentPhone, 'social'), '_blank');
});
dorkDocs.addEventListener('click', () => {
  if (currentPhone) window.open(generateGoogleDork(currentPhone, 'docs'), '_blank');
});
dorkCommunity.addEventListener('click', () => {
  if (currentPhone) window.open(generateGoogleDork(currentPhone, 'community'), '_blank');
});
dorkLeak.addEventListener('click', () => {
  if (currentPhone) window.open(generateGoogleDork(currentPhone, 'leak'), '_blank');
});

function showError(msg = 'Please enter a valid phone number specimen.') {
  elResults.classList.add('hidden')
  elError.querySelector('p').textContent = msg
  elError.classList.remove('hidden')
}

function parseAuto(raw) {
  if (raw.startsWith('+')) return parsePhoneNumberFromString(raw)
  let phone = parsePhoneNumberFromString(raw, homeCountry)
  if ((!phone || !phone.isValid()) && homeCountry !== 'IE' && raw.startsWith('0')) {
    const secondaryPhone = parsePhoneNumberFromString(raw, 'IE')
    if (secondaryPhone && secondaryPhone.isValid()) return secondaryPhone
  }
  return phone
}

function analyze() {
  const region = elRegion.value
  const raw = (elInput.value || '').trim()
  if (!raw) return showError()
  try {
    const phone = region ? parsePhoneNumberFromString(raw, region) : parseAuto(raw)
    if (phone) {
      updateUI(phone)
    } else {
      showError(region ? undefined : `Unrecognized format. Use "+" or select a region.`)
    }
  } catch (e) {
    showError()
  }
}

// Side Panel Logic
elDetailsBtn.addEventListener('click', () => {
  elSidePanel.classList.remove('hidden')
  document.body.style.overflow = 'hidden'
})

const closePanel = () => {
  elSidePanel.classList.add('hidden')
  document.body.style.overflow = ''
}

elClosePanel.addEventListener('click', closePanel)
elOverlay.addEventListener('click', closePanel)

// Manual home country override
if (elCurrentHome) {
  elCurrentHome.style.cursor = 'pointer'
  elCurrentHome.addEventListener('click', () => {
    const newHome = prompt("Enter your Default Local country code (e.g. IE, US, GB):", homeCountry)
    if (newHome && newHome.length === 2) {
      homeCountry = newHome.toUpperCase()
      localStorage.setItem('home-country', homeCountry)
      elCurrentHome.textContent = homeCountry
      elInput.placeholder = `Include + or enter local (${homeCountry})`
    }
  })
}

elRegion.addEventListener('change', () => {
  if (!elRegion.value) {
    elInput.placeholder = `Include + or enter local (${homeCountry})`
  } else {
    elInput.placeholder = "Enter phone number..."
  }
})

elInput.addEventListener('input', (e) => {
  const currentVal = e.target.value
  const region = elRegion.value || (currentVal.startsWith('+') ? undefined : homeCountry)
  const formatter = new AsYouType(region)
  const formatted = formatter.input(currentVal)
  if (formatted.length > 5) {
    const phone = region ? parsePhoneNumberFromString(formatted, region) : parseAuto(formatted)
    if (phone && phone.isValid()) {
      updateUI(phone)
    }
  }
})

elAnalyze.addEventListener('click', analyze)
elInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') analyze() })

window.addEventListener('DOMContentLoaded', () => {
  if (!elRegion.value) elInput.placeholder = `Include + or enter local (${homeCountry})`
  elInput.focus()
})
