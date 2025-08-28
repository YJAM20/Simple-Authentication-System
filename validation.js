const form = document.getElementById('form')
const firstname_input = document.getElementById('firstname-input')
const email_input = document.getElementById('email-input')
const password_input = document.getElementById('password-input')
const repeat_password_input = document.getElementById('repeat-password-input')
const error_message = document.getElementById('error-message')

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    let errors = []

    if (firstname_input) {
      // Signup page
      errors = getSignupFormErrors(firstname_input.value, email_input.value, password_input.value, repeat_password_input.value)
      if (errors.length > 0) {
        error_message.innerText = errors.join('. ')
        return
      }
      const success = handleSignup({ firstname: firstname_input.value.trim(), email: email_input.value.trim(), password: password_input.value })
      if (!success.ok) {
        error_message.innerText = success.message
        return
      }
      window.location.href = 'index.html'
    } else {
      // Login page
      errors = getLoginFormErrors(email_input.value, password_input.value)
      if (errors.length > 0) {
        error_message.innerText = errors.join('. ')
        return
      }
      const success = handleLogin({ email: email_input.value.trim(), password: password_input.value })
      if (!success.ok) {
        error_message.innerText = success.message
        return
      }
      window.location.href = 'index.html'
    }
  })
}

function getSignupFormErrors(firstname, email, password, repeatPassword){
  let errors = []

  if(firstname === '' || firstname == null){
    errors.push('Firstname is required')
    markIncorrect(firstname_input)
  }
  if(email === '' || email == null){
    errors.push('Email is required')
    markIncorrect(email_input)
  }
  if(password === '' || password == null){
    errors.push('Password is required')
    markIncorrect(password_input)
  }
  if(password.length < 8){
    errors.push('Password must have at least 8 characters')
    markIncorrect(password_input)
  }
  if(password !== repeatPassword){
    errors.push('Password does not match repeated password')
    markIncorrect(password_input)
    markIncorrect(repeat_password_input)
  }


  return errors;
}

function getLoginFormErrors(email, password){
  let errors = []

  if(email === '' || email == null){
    errors.push('Email is required')
    markIncorrect(email_input)
  }
  if(password === '' || password == null){
    errors.push('Password is required')
    markIncorrect(password_input)
  }

  return errors;
}

function markIncorrect(input) {
  if (input && input.parentElement) {
    input.parentElement.classList.add('incorrect');
  }
}

const allInputs = [firstname_input, email_input, password_input, repeat_password_input].filter(input => input != null)

allInputs.forEach(input => {
  input.addEventListener('input', () => {
    if(input.parentElement.classList.contains('incorrect')){
      input.parentElement.classList.remove('incorrect')
      error_message.innerText = ''
    }
  })
})

// ---------------------------------------------
// Client-side auth: localStorage + sessionStorage
// ---------------------------------------------

function getUsers() {
  try {
    const raw = localStorage.getItem('users')
    return raw ? JSON.parse(raw) : []
  } catch (_) {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users))
}

function handleSignup({ firstname, email, password }) {
  const users = getUsers()
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (existing) {
    return { ok: false, message: 'An account with this email already exists' }
  }
  users.push({ firstname, email, password })
  saveUsers(users)
  sessionStorage.setItem('currentUserEmail', email)
  return { ok: true }
}

function handleLogin({ email, password }) {
  const users = getUsers()
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    return { ok: false, message: 'No account found for this email' }
  }
  if (user.password !== password) {
    return { ok: false, message: 'Incorrect password' }
  }
  sessionStorage.setItem('currentUserEmail', user.email)
  return { ok: true }
}

function getCurrentUser() {
  const email = sessionStorage.getItem('currentUserEmail')
  if (!email) return null
  const users = getUsers()
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

function logout() {
  sessionStorage.removeItem('currentUserEmail')
}

// Home page wiring (welcome + logout)
document.addEventListener('DOMContentLoaded', () => {
  const welcomeText = document.getElementById('welcome-text')
  const logoutButton = document.getElementById('logout-button')
  const authLinks = document.getElementById('auth-links')

  if (welcomeText || logoutButton || authLinks) {
    const user = getCurrentUser()
    if (user) {
      if (welcomeText) welcomeText.innerText = `Welcome, ${user.firstname}!`
      if (logoutButton) logoutButton.style.display = 'inline-block'
      if (authLinks) authLinks.style.display = 'none'
    } else {
      if (welcomeText) welcomeText.innerText = 'You are not logged in.'
      if (logoutButton) logoutButton.style.display = 'none'
      if (authLinks) authLinks.style.display = 'block'
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        logout()
        window.location.href = 'login.html'
      })
    }
  }
})