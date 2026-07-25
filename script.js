// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Copy IP function
function copyIP() {
  const ip = "novapixel.host:25565"
  navigator.clipboard
    .writeText(ip)
    .then(() => {
      // Create notification
      const notification = document.createElement("div")
      notification.textContent = "¡IP copiada al portapapeles!"
      notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00d4ff, #0099cc);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `

      // Add animation keyframes
      if (!document.querySelector("#notification-styles")) {
        const style = document.createElement("style")
        style.id = "notification-styles"
        style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `
        document.head.appendChild(style)
      }

      document.body.appendChild(notification)

      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease-out"
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 300)
      }, 3000)
    })
    .catch(() => {
      alert("IP del servidor: " + ip)
    })
}
// Copy IP function
function copyIP1() {
  const ip = "novapixel.host  Puerto: 25565"
  navigator.clipboard
    .writeText(ip)
    .then(() => {
      // Create notification
      const notification = document.createElement("div")
      notification.textContent = "¡IP copiada al portapapeles!"
      notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00d4ff, #0099cc);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `

      // Add animation keyframes
      if (!document.querySelector("#notification-styles")) {
        const style = document.createElement("style")
        style.id = "notification-styles"
        style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `
        document.head.appendChild(style)
      }

      document.body.appendChild(notification)

      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease-out"
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 300)
      }, 3000)
    })
    .catch(() => {
      alert("IP del servidor: " + ip)
    })
}

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar")
  if (window.scrollY > 100) {
    navbar.style.background = "rgba(10, 10, 10, 0.98)"
  } else {
    navbar.style.background = "rgba(10, 10, 10, 0.95)"
  }
})

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animation = "fadeInUp 0.8s ease-out forwards"
    }
  })
}, observerOptions)

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
  const animateElements = document.querySelectorAll(".feature-card, .rule-item, .event-card")
  animateElements.forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(30px)"
    observer.observe(el)
  })
})

// Mobile menu toggle (if needed)
const createMobileMenu = () => {
  const navbar = document.querySelector(".navbar")
  const navLinks = document.querySelector(".nav-links")

  if (window.innerWidth <= 768) {
    if (!document.querySelector(".mobile-menu-btn")) {
      const menuBtn = document.createElement("button")
      menuBtn.className = "mobile-menu-btn"
      menuBtn.innerHTML = '<i class="fas fa-bars"></i>'
      menuBtn.style.cssText = `
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                display: block;
            `

      menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("mobile-active")
      })

      navbar.querySelector(".nav-content").appendChild(menuBtn)
    }
  }
}

// Add mobile menu styles
const mobileStyles = document.createElement("style")
mobileStyles.textContent = `
    @media (max-width: 768px) {
        .nav-links.mobile-active {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(10, 10, 10, 0.98);
            padding: 20px;
            border-top: 1px solid #2a2a3e;
        }
        
        .nav-links {
            display: none;
        }
        
        .mobile-menu-btn {
            display: block !important;
        }
    }
    
    @media (min-width: 769px) {
        .mobile-menu-btn {
            display: none !important;
        }
    }
`
document.head.appendChild(mobileStyles)

// Initialize mobile menu on load and resize
window.addEventListener("load", createMobileMenu)
window.addEventListener("resize", createMobileMenu)

// Carousel functionality for hero images
let slideIndex = 1
let slideInterval

function showSlides(n) {
  const slides = document.getElementsByClassName("hero-slide")
  const dots = document.getElementsByClassName("dot")

  if (n > slides.length) {
    slideIndex = 1
  }
  if (n < 1) {
    slideIndex = slides.length
  }

  for (let i = 0; i < slides.length; i++) {
    slides[i].classList.remove("active")
  }

  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active")
  }

  if (slides[slideIndex - 1]) {
    slides[slideIndex - 1].classList.add("active")
  }

  if (dots[slideIndex - 1]) {
    dots[slideIndex - 1].classList.add("active")
  }
}

function currentSlide(n) {
  clearInterval(slideInterval)
  showSlides((slideIndex = n))
  startAutoSlide()
}

function nextSlide() {
  showSlides((slideIndex += 1))
}

function startAutoSlide() {
  slideInterval = setInterval(nextSlide, 8000) // Change slide every 8 seconds
}

// Initialize carousel when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Wait a bit for images to load
  setTimeout(() => {
    showSlides(slideIndex)
    startAutoSlide()
  }, 100)
})
