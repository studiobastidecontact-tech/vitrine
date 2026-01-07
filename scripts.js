// ===== DÉTECTION DU ZOOM NAVIGATEUR =====
function detectZoomLevel() {
  // Méthode 1: Comparer devicePixelRatio avec le ratio de l'écran
  const pixelRatio = window.devicePixelRatio || 1;

  // Méthode 2: Détecter via la largeur de la fenêtre vs viewport
  const screenWidth = window.screen.width;
  const windowWidth = window.innerWidth;

  // Calculer un ratio approximatif du zoom
  // Si l'écran fait 1920px et que la fenêtre affiche 1280px, c'est du 150% zoom
  const estimatedZoom = screenWidth / windowWidth;

  console.log("Détection zoom:", {
    devicePixelRatio: pixelRatio,
    screenWidth: screenWidth,
    windowWidth: windowWidth,
    estimatedZoom: estimatedZoom.toFixed(2),
    isZoomHigh: estimatedZoom >= 1.4 || windowWidth < 1400,
  });

  // Si le zoom estimé est >= 140% OU si la largeur de fenêtre est < 1400px (indicateur de zoom ou petit écran)
  // On applique les styles réduits
  if (estimatedZoom >= 1.4 || (windowWidth < 1400 && screenWidth > 1600)) {
    document.body.classList.add("zoom-high");
    console.log("✅ Classe zoom-high APPLIQUÉE");
  } else {
    document.body.classList.remove("zoom-high");
    console.log("❌ Classe zoom-high RETIRÉE");
  }
}

// Détecter le zoom au chargement
detectZoomLevel();

// Détecter les changements de zoom/resize
window.addEventListener("resize", detectZoomLevel);

// Attendre que le DOM soit chargé
document.addEventListener("DOMContentLoaded", function () {
  // ===== BURGER MENU =====
  const burgerBtn = document.getElementById("burger-btn");
  const menuOverlay = document.getElementById("menu-overlay");
  const burgerIcon = document.getElementById("burger-icon");
  const closeIcon = document.getElementById("close-icon");
  const menuLinks = document.querySelectorAll(".menu-link");

  // Toggle menu
  burgerBtn.addEventListener("click", function () {
    const isOpen = menuOverlay.classList.contains("translate-x-0");

    if (isOpen) {
      // Fermer le menu
      menuOverlay.classList.remove("translate-x-0");
      menuOverlay.classList.add("translate-x-full");
      burgerIcon.classList.remove("hidden");
      closeIcon.classList.add("hidden");
    } else {
      // Ouvrir le menu
      menuOverlay.classList.remove("translate-x-full");
      menuOverlay.classList.add("translate-x-0");
      burgerIcon.classList.add("hidden");
      closeIcon.classList.remove("hidden");
    }
  });

  // Fermer le menu quand on clique sur un lien
  menuLinks.forEach((link) => {
    link.addEventListener("click", function () {
      menuOverlay.classList.remove("translate-x-0");
      menuOverlay.classList.add("translate-x-full");
      burgerIcon.classList.remove("hidden");
      closeIcon.classList.add("hidden");
    });
  });

  // ===== SCROLL EFFECTS =====
  const navbar = document.getElementById("navbar");
  const logo = document.getElementById("logo");

  // Clic sur le logo pour remonter en haut
  logo.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("scroll", function () {
    const scrollPosition = window.scrollY;

    // Logo size
    if (scrollPosition > 100) {
      logo.classList.add("scrolled");
    } else {
      logo.classList.remove("scrolled");
    }

    // Animation d'opacité caractère par caractère
    animateCharactersByScroll();
  });

  // ===== WRAPPER TEXTE EN MOTS =====
  function wrapTextInChars() {
    const textElements = document.querySelectorAll("[data-text-reveal]");

    textElements.forEach((element) => {
      // Ne traiter que les éléments p et strong (en profondeur)
      const textNodes = element.querySelectorAll("p, strong, h2");

      textNodes.forEach((node) => {
        // Skip si déjà traité
        if (node.querySelector(".word")) return;

        // Nettoyer le texte : enlever espaces multiples et retours à la ligne
        const text = node.textContent.trim().replace(/\s+/g, " ");
        const words = text.split(" ");
        node.innerHTML = ""; // Vider le contenu

        // Wrapper chaque mot
        words.forEach((word, wordIndex) => {
          const wordSpan = document.createElement("span");
          wordSpan.className = "word";
          wordSpan.style.display = "inline-block";
          wordSpan.style.whiteSpace = "nowrap";

          // Wrapper chaque caractère du mot
          for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const charSpan = document.createElement("span");
            charSpan.className = "char";
            charSpan.textContent = char;
            charSpan.dataset.wordIndex = wordIndex;
            charSpan.dataset.charIndex = i;
            wordSpan.appendChild(charSpan);
          }

          node.appendChild(wordSpan);

          // Ajouter un espace après chaque mot sauf le dernier
          if (wordIndex < words.length - 1) {
            const space = document.createElement("span");
            space.className = "char space";
            space.textContent = "\u00A0";
            space.style.display = "inline-block";
            node.appendChild(space);
          }
        });
      });
    });
  }

  // ===== ANIMATION D'OPACITÉ CARACTÈRE PAR CARACTÈRE AU SCROLL =====
  function animateCharactersByScroll() {
    const textElements = document.querySelectorAll("[data-text-reveal]");

    textElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // Calculer le pourcentage de visibilité de l'élément
      if (elementTop < windowHeight && elementTop + elementHeight > 0) {
        const chars = element.querySelectorAll(".char");
        const totalChars = chars.length;

        if (totalChars === 0) return; // Si pas de caractères, ne rien faire

        // Calculer combien de caractères doivent être révélés
        const scrollProgress = Math.min(
          1,
          Math.max(0, (windowHeight - elementTop) / (windowHeight * 0.7))
        );

        const charsToReveal = Math.floor(scrollProgress * totalChars);

        // Révéler les caractères progressivement
        chars.forEach((char, index) => {
          if (index < charsToReveal) {
            char.classList.add("revealed");
          } else {
            char.classList.remove("revealed");
          }
        });
      }
    });
  }

  // Initialiser le wrapper de texte
  wrapTextInChars();

  // Lancer l'animation au chargement
  animateCharactersByScroll();

  // ===== AUDIO PLAYERS =====
  function initAudioPlayers() {
    const audioPlayers = document.querySelectorAll(".audio-player");

    audioPlayers.forEach((player) => {
      const audio = player.querySelector("audio");
      const playPauseBtn = player.querySelector(".play-pause-btn");
      const playIcon = player.querySelector(".play-icon");
      const pauseIcon = player.querySelector(".pause-icon");
      const currentTimeSpan = player.querySelector(".current-time");
      const totalTimeSpan = player.querySelector(".total-time");
      const progressBar = player.querySelector(".progress-bar");
      const progressContainer = player.querySelector(".progress-bar-container");
      const volumeSlider = player.querySelector(".volume-slider");

      // Charger la durée totale
      audio.addEventListener("loadedmetadata", () => {
        totalTimeSpan.textContent = formatTime(audio.duration);
      });

      // Play/Pause
      playPauseBtn.addEventListener("click", () => {
        if (audio.paused) {
          // Pause tous les autres players
          audioPlayers.forEach((p) => {
            const a = p.querySelector("audio");
            if (a !== audio && !a.paused) {
              a.pause();
              p.querySelector(".play-icon").classList.remove("hidden");
              p.querySelector(".pause-icon").classList.add("hidden");
            }
          });
          audio.play();
          playIcon.classList.add("hidden");
          pauseIcon.classList.remove("hidden");
        } else {
          audio.pause();
          playIcon.classList.remove("hidden");
          pauseIcon.classList.add("hidden");
        }
      });

      // Mise à jour du temps et de la progression
      audio.addEventListener("timeupdate", () => {
        currentTimeSpan.textContent = formatTime(audio.currentTime);
        if (progressBar) {
          const progress = (audio.currentTime / audio.duration) * 100;
          progressBar.style.width = progress + "%";
        }
      });

      // Clic sur la barre de progression
      if (progressContainer) {
        progressContainer.addEventListener("click", (e) => {
          const rect = progressContainer.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          audio.currentTime = percent * audio.duration;
        });
      }

      // Volume
      volumeSlider.addEventListener("input", (e) => {
        audio.volume = e.target.value / 100;
      });

      // Fin de la musique
      audio.addEventListener("ended", () => {
        playIcon.classList.remove("hidden");
        pauseIcon.classList.add("hidden");
        audio.currentTime = 0;
        if (progressBar) {
          progressBar.style.width = "0%";
        }
        currentTimeSpan.textContent = "00:00";
      });
    });
  }

  // Formater le temps (mm:ss)
  function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Initialiser les players
  initAudioPlayers();

  // ===== AUTOPAUSE DES LECTEURS AUDIO AU SCROLL =====
  function initAudioScrollPause() {
    const audioPlayers = document.querySelectorAll(".audio-player");
    const audioContent = document.getElementById("audio-content");

    audioPlayers.forEach((player) => {
      const audio = player.querySelector("audio");
      const playIcon = player.querySelector(".play-icon");
      const pauseIcon = player.querySelector(".pause-icon");

      if (audio) {
        const audioObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach((entry) => {
              // Vérifier que l'onglet audio est actif
              if (audioContent && audioContent.classList.contains("hidden")) {
                return;
              }

              if (!entry.isIntersecting) {
                // Le lecteur audio sort de l'écran : le mettre en pause
                if (!audio.paused) {
                  audio.pause();
                  if (playIcon) playIcon.classList.remove("hidden");
                  if (pauseIcon) pauseIcon.classList.add("hidden");
                }
              }
            });
          },
          {
            threshold: 0.1, // Déclencher quand moins de 10% du lecteur est visible
          }
        );

        // Observer le lecteur audio
        audioObserver.observe(player);
      }
    });
  }

  // Initialiser la pause automatique au scroll pour les lecteurs audio
  initAudioScrollPause();

  // Fonction pour mettre en pause tous les lecteurs audio
  function pauseAllAudioPlayers() {
    const audioPlayers = document.querySelectorAll(".audio-player");
    audioPlayers.forEach((player) => {
      const audio = player.querySelector("audio");
      if (audio && !audio.paused) {
        audio.pause();
        const playIcon = player.querySelector(".play-icon");
        const pauseIcon = player.querySelector(".pause-icon");
        if (playIcon) playIcon.classList.remove("hidden");
        if (pauseIcon) pauseIcon.classList.add("hidden");
      }
    });
  }

  // ===== SYSTÈME D'ONGLETS (AUDIO/VIDÉOS) =====
  const tabAudio = document.getElementById("tab-audio");
  const tabVideos = document.getElementById("tab-videos");
  const audioContent = document.getElementById("audio-content");
  const videosContent = document.getElementById("videos-content");

  // Par défaut, Audio est sélectionné
  tabAudio.addEventListener("click", function () {
    // Activer l'onglet Audio
    tabAudio.classList.add("border-white", "text-white");
    tabAudio.classList.remove("border-transparent", "text-gray-500");

    // Désactiver l'onglet Vidéos
    tabVideos.classList.remove("border-white", "text-white");
    tabVideos.classList.add("border-transparent", "text-gray-500");

    // Afficher le skeleton puis le contenu Audio
    const audioSkeleton = document.getElementById("audio-skeleton");
    const audioContentInner = document.getElementById("audio-content-inner");
    const videoSkeleton = document.getElementById("video-skeleton");

    videosContent.classList.add("hidden");
    if (videoSkeleton) videoSkeleton.classList.add("hidden");

    if (audioSkeleton) audioSkeleton.classList.remove("hidden");
    if (audioContentInner) audioContentInner.classList.add("hidden");

    audioContent.classList.remove("hidden");

    // Simuler un chargement pour éviter le saut de page
    setTimeout(() => {
      if (audioSkeleton) audioSkeleton.classList.add("hidden");
      if (audioContentInner) audioContentInner.classList.remove("hidden");
    }, 300);

    // Mettre la vidéo en pause
    if (mainVideo) {
      mainVideo.pause();
    }
  });

  tabVideos.addEventListener("click", function () {
    // Mettre en pause tous les lecteurs audio
    pauseAllAudioPlayers();

    // Activer l'onglet Vidéos
    tabVideos.classList.add("border-white", "text-white");
    tabVideos.classList.remove("border-transparent", "text-gray-500");

    // Désactiver l'onglet Audio
    tabAudio.classList.remove("border-white", "text-white");
    tabAudio.classList.add("border-transparent", "text-gray-500");

    // Afficher le skeleton puis le contenu Vidéos
    const videoSkeleton = document.getElementById("video-skeleton");
    const videoContentInner = document.getElementById("video-content-inner");
    const audioSkeleton = document.getElementById("audio-skeleton");

    audioContent.classList.add("hidden");
    if (audioSkeleton) audioSkeleton.classList.add("hidden");

    if (videoSkeleton) videoSkeleton.classList.remove("hidden");
    if (videoContentInner) videoContentInner.classList.add("hidden");

    videosContent.classList.remove("hidden");

    // Simuler un chargement pour éviter le saut de page
    setTimeout(() => {
      if (videoSkeleton) videoSkeleton.classList.add("hidden");
      if (videoContentInner) videoContentInner.classList.remove("hidden");

      // Lancer la vidéo automatiquement après le chargement
      if (mainVideo && videoSources.length > 0) {
        // Toujours charger la première vidéo pour s'assurer qu'elle est prête
        loadAndPlayVideo(0);

        // Scroll vers la vidéo après un court délai pour laisser le temps au chargement
        setTimeout(() => {
          if (mainVideo) {
            mainVideo.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 400);
      }
    }, 300);
  });

  // ===== AUTOPLAY DE LA VIDÉO PRINCIPALE AU SCROLL =====
  const mainVideoForAutoplay = document.getElementById("main-video");
  if (mainVideoForAutoplay && videosContent) {
    const videoAutoplayObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach((entry) => {
          // Vérifier que l'onglet vidéo est actif
          if (videosContent.classList.contains("hidden")) {
            return;
          }

          if (entry.isIntersecting) {
            // La vidéo entre dans l'écran : la lancer
            mainVideoForAutoplay.play().catch((error) => {
              console.log("Autoplay de la vidéo bloqué:", error);
            });
          } else {
            // La vidéo sort complètement de l'écran : la mettre en pause
            mainVideoForAutoplay.pause();
          }
        });
      },
      {
        threshold: 0.1, // Déclencher quand au moins 10% de la vidéo est visible
      }
    );

    // Observer directement la vidéo
    videoAutoplayObserver.observe(mainVideoForAutoplay);
  }

  // ===== LIENS SOUS-MENUS DANS BURGER =====
  // Gérer les clics sur "Réalisations son" et "Réalisations vidéo"
  const allMenuLinks = document.querySelectorAll(
    '#menu-overlay a[href="#nos-creations"]'
  );
  allMenuLinks.forEach((link, index) => {
    link.addEventListener("click", function (e) {
      // Si c'est "Réalisations son" (premier lien)
      if (link.textContent.includes("Réalisations son")) {
        e.preventDefault();
        // Activer l'onglet Audio avant de scroller
        tabAudio.click();
        // Attendre un peu puis scroller
        setTimeout(() => {
          document.querySelector("#nos-creations").scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
      // Si c'est "Réalisations vidéo" (deuxième lien)
      else if (link.textContent.includes("Réalisations vidéo")) {
        e.preventDefault();
        // Activer l'onglet Vidéos avant de scroller
        tabVideos.click();
        // Attendre un peu puis scroller
        setTimeout(() => {
          document.querySelector("#nos-creations").scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    });
  });

  // ===== FORMULAIRE DE CONTACT =====
  const contactForm = document.getElementById("contact-form");

  emailjs.init("ytHKxQLRKzU342fff");

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Désactiver le bouton pendant l'envoi
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "ENVOI EN COURS...";

    // Récupérer les valeurs du formulaire
    const formData = {
      from_email: document.getElementById("email").value,
      subject: document.getElementById("objet").value,
      message: document.getElementById("message").value,
    };

    // Envoyer l'email via EmailJS
    emailjs.send("service_t3azqdo", "template_i7rxtxn", formData).then(
      function (response) {
        // Succès
        alert(
          "Merci pour votre message ! Nous vous répondrons dans les plus brefs délais."
        );
        contactForm.reset();
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      },
      function (error) {
        // Erreur
        console.error("Erreur lors de l'envoi:", error);
        alert(
          "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer plus tard."
        );
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    );
  });

  // ===== VIDÉOS - Gestion des miniatures et progression =====
  const mainVideo = document.getElementById("main-video");
  // videosContent est déjà déclaré plus haut, ne pas le redéclarer
  let videoThumbnails = document.querySelectorAll(".video-thumbnail");
  let currentVideoIndex = 0;

  // Chemins des vidéos MP4 (à mettre dans assets/videos/)
  const videoSources = [
    "assets/videos/video5.mp4", // alpine (maintenant première)
    "assets/videos/video1.mp4", // Mon nom est Alexandre Cavalier (maintenant deuxième)
    "assets/videos/video3.mp4", // MAKING-OF ALTO WATCH
    "assets/videos/video2.mp4", // LEO Walk - ALTO WATCH
    "assets/videos/video4.mp4", // alto WQTCH PUB
    "assets/videos/video6.mp4", // EP 1
    "assets/videos/video7.mp4", // EP 2
    "assets/videos/video8.mp4", // EP3
    "assets/videos/video9.mp4", // EP4
    "assets/videos/video10.mp4", // EP5
    "assets/videos/video11.mp4", // EP6
    "assets/videos/video12.mp4", // EP7
    "assets/videos/video13.mp4", // EP 8
    "assets/videos/video14.mp4", // EP 9
  ];

  // IDs YouTube pour les miniatures (temporaire, en attendant les MP4)
  const youtubeIds = [
    "fbyIUvPFW8A", // alpine (maintenant première)
    "SL4TNhToFns", // Mon nom est Alexandre Cavalier (maintenant deuxième)
    "eRZfwzOD0U0", // MAKING-OF ALTO WATCH[
    "lkLfYOta3bU", // LEO Walk - ALTO WATCH
    "cmt147mwLu4", // alto WQTCH PUB
    "ySfBBxVpcDE", // EP 1
    "m5NYm08dves", // EP 2
    "V2iMFDCzlA4", // EP3
    "naAyDnpjTHw", // EP4
    "8Y4awGvoRJ8", // EP5
    "rrDkzc4YCeg", // EP6
    "yKfVMG7LjHw", // EP7
    "nJRTe0PZP2A", // EP 8
    "n2ozk2Tcpps", // EP 9
  ];

  // Fonction pour générer les miniatures
  function generateThumbnails() {
    const desktopContainer = document.querySelector(
      ".hidden.md\\:block .flex.overflow-x-auto"
    );
    const mobileContainer = document.querySelector(
      ".md\\:hidden .flex.overflow-x-auto"
    );

    // Nettoyer les conteneurs existants
    if (desktopContainer) desktopContainer.innerHTML = "";
    if (mobileContainer) mobileContainer.innerHTML = "";

    videoSources.forEach((source, index) => {
      const videoId = youtubeIds[index] || "";
      const thumbnailUrl = videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : "https://picsum.photos/300/200?random=" + (index + 1);
      const isActive = index === 0;

      const thumbnailHTML = `
        <div
          class="video-thumbnail flex-shrink-0 w-32 md:w-40 cursor-pointer relative group"
          data-video-index="${index}"
        >
          <div class="relative">
            <img
              src="${thumbnailUrl}"
              alt="Vidéo ${index + 1}"
              class="w-full h-auto rounded border-2 ${
                isActive ? "border-white" : "border-transparent"
              } group-hover:border-white transition-colors"
              onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'"
            />
            <div
              class="video-progress-overlay absolute inset-0 bg-white opacity-0 rounded"
              style="clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%)"
            ></div>
          </div>
        </div>
      `;

      if (desktopContainer) {
        desktopContainer.insertAdjacentHTML("beforeend", thumbnailHTML);
      }
      if (mobileContainer) {
        const mobileThumbnailHTML = thumbnailHTML.replace(
          "w-32 md:w-40",
          "w-32"
        );
        mobileContainer.insertAdjacentHTML("beforeend", mobileThumbnailHTML);
      }
    });

    // Réattacher les event listeners après génération
    const newThumbnails = document.querySelectorAll(".video-thumbnail");
    newThumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", function () {
        const videoIndex = parseInt(thumbnail.getAttribute("data-video-index"));
        if (!isNaN(videoIndex) && videoIndex < videoSources.length) {
          loadAndPlayVideo(videoIndex);
        }
      });
    });

    // Mettre à jour la référence globale
    videoThumbnails = newThumbnails;
  }

  // Générer les miniatures au chargement
  generateThumbnails();

  // Fonction pour mettre à jour la vidéo active
  function updateActiveVideo(index) {
    // Retirer la classe active de toutes les miniatures
    videoThumbnails.forEach((thumb) => {
      thumb.classList.remove("active");
      const img = thumb.querySelector("img");
      if (img) {
        img.classList.remove("border-white");
        img.classList.add("border-transparent");
      }
    });

    // Ajouter la classe active à la miniature sélectionnée
    if (videoThumbnails[index]) {
      videoThumbnails[index].classList.add("active");
      const img = videoThumbnails[index].querySelector("img");
      if (img) {
        img.classList.remove("border-transparent");
        img.classList.add("border-white");
      }
    }

    currentVideoIndex = index;
  }

  // Clic sur les miniatures
  videoThumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", function () {
      // Utiliser data-video-index au lieu de l'index de la boucle pour gérer desktop + mobile
      const videoIndex = parseInt(thumbnail.getAttribute("data-video-index"));
      if (!isNaN(videoIndex) && videoIndex < videoSources.length) {
        loadAndPlayVideo(videoIndex);
      }
    });
  });

  // Fonction pour charger et lancer une vidéo
  function loadAndPlayVideo(index) {
    if (mainVideo && videoSources[index]) {
      const sourceElement = mainVideo.querySelector("source");
      if (sourceElement) {
        // Changer la source de la vidéo principale
        sourceElement.src = videoSources[index];
        mainVideo.load();
      }

      // Mettre à jour la miniature active
      if (videoThumbnails && videoThumbnails.length > index) {
        updateActiveVideo(index);
      }

      // Scroll automatique vers la vidéo
      setTimeout(() => {
        if (mainVideo) {
          mainVideo.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);

      // Attendre que la vidéo soit prête avant de jouer
      const playWhenReady = function playVideo() {
        if (mainVideo.readyState >= 2) {
          // HAVE_CURRENT_DATA ou plus
          mainVideo.play().catch((error) => {
            console.log("Autoplay de la vidéo bloqué:", error);
          });
          mainVideo.removeEventListener("loadeddata", playWhenReady);
          mainVideo.removeEventListener("canplay", playWhenReady);
        }
      };

      // Essayer de jouer immédiatement si la vidéo est déjà prête
      if (mainVideo.readyState >= 2) {
        mainVideo.play().catch((error) => {
          console.log("Autoplay de la vidéo bloqué:", error);
        });
      } else {
        // Sinon attendre que la vidéo soit chargée
        mainVideo.addEventListener("loadeddata", playWhenReady, { once: true });
        mainVideo.addEventListener("canplay", playWhenReady, { once: true });
      }
    }
  }

  // Mettre à jour la progression de la vidéo sur la miniature active
  if (mainVideo) {
    mainVideo.addEventListener("timeupdate", function () {
      const progress = (mainVideo.currentTime / mainVideo.duration) * 100;
      const activeThumbnail = videoThumbnails[currentVideoIndex];

      if (activeThumbnail) {
        const progressOverlay = activeThumbnail.querySelector(
          ".video-progress-overlay"
        );
        if (progressOverlay) {
          progressOverlay.style.clipPath = `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`;
        }
      }
    });

    // Réinitialiser la progression quand la vidéo change
    mainVideo.addEventListener("loadstart", function () {
      const activeThumbnail = videoThumbnails[currentVideoIndex];
      if (activeThumbnail) {
        const progressOverlay = activeThumbnail.querySelector(
          ".video-progress-overlay"
        );
        if (progressOverlay) {
          progressOverlay.style.clipPath =
            "polygon(0 0, 0% 0, 0% 100%, 0 100%)";
        }
      }
    });

    // Lecture automatique en chaîne : passer à la vidéo suivante quand une vidéo se termine
    mainVideo.addEventListener("ended", function () {
      // Vérifier que l'onglet vidéo est actif
      if (videosContent && !videosContent.classList.contains("hidden")) {
        // Passer à la vidéo suivante
        const nextIndex = (currentVideoIndex + 1) % videoSources.length;
        loadAndPlayVideo(nextIndex);
      }
    });
  }

  // Initialiser la première vidéo comme active
  updateActiveVideo(0);

  // ===== GESTION DE LA VIDÉO HERO =====
  const heroVideo = document.getElementById("hero-video");

  // S'assurer que la vidéo se lance automatiquement
  heroVideo.play().catch((error) => {
    console.log("Autoplay bloqué par le navigateur:", error);
  });

  // Optimisation: Pause la vidéo quand elle n'est plus visible
  const observerOptions = {
    threshold: 0.1,
  };

  const videoObserver = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        heroVideo.play();
      } else {
        heroVideo.pause();
      }
    });
  }, observerOptions);

  videoObserver.observe(heroVideo);

  // ===== SMOOTH SCROLL POUR TOUS LES LIENS ANCRES =====
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");

      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // ===== ANIMATION D'ENTRÉE AU CHARGEMENT =====
  setTimeout(() => {
    document.body.classList.add("loaded");
  }, 100);

  // ===== LIEN REMONTER DANS LE FOOTER =====
  const footerScrollTop = document.getElementById("footer-scroll-top");
  if (footerScrollTop) {
    footerScrollTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
});
