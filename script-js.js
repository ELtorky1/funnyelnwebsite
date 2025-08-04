const firebaseConfig = {  
  apiKey: "AIzaSyDNhAbyXg9Yt2LGBERsLtNenu8h00WDRyA",  
  authDomain: "kalf-a6026.firebaseapp.com",  
  databaseURL: "https://kalf-a6026-default-rtdb.firebaseio.com", // تم التصحيح هنا  
  projectId: "kalf-a6026",  
  storageBucket: "kalf-a6026.appspot.com",  
  messagingSenderId: "719696195630",  
  appId: "1:719696195630:web:7f08a732c914e38db92fbf"  
};const firebaseConfig = {
    apiKey: "AIzaSyDNhAbyXg9Yt2LGBERsLtNenu8h00WDRyA",
    authDomain: "kalf-a6026.firebaseapp.com",
    databaseURL: "https://kalf-a6026-default-rtdb.firebaseio.com",
    projectId: "kalf-a6026",
    storageBucket: "kalf-a6026.appspot.com",
    messagingSenderId: "719696195630",
    appId: "1:719696195630:web:7f08a732c914e38db92fbf"
  };

  firebase.initializeApp(firebaseConfig);
  // uid ثابت في localStorage
  // استخدام uid من الجلسة
let uid = null;
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    uid = user.uid;
    document.getElementById("loginto").style.display = "none";
  } else {
    uid = null;
    document.getElementById("loginto").style.display = "block";
  }
});
function setupReactions(card, postId) {
  const spans = card.querySelectorAll('.reactions span');

  // ✅ عرض أعداد التفاعلات الحقيقية على كل إيموجي
  countPostReactions(postId, card);

  // ⛔ لو مفيش uid اطبع وخلاص
  

  // ✅ استرجاع التفاعل القديم من فايربيز
  firebase.database().ref("reactions/" + postId + "/" + uid).once("value")
    .then(snapshot => {
      const oldReaction = snapshot.val();
      if (oldReaction) {
        spans.forEach(span => {
          const emoji = span.textContent.trim().slice(0, 2);
          if (emoji === oldReaction) {
            span.classList.add("active");
          }
        });
      }
    });

  // ✅ التعامل مع الضغط على أي إيموجي
  spans.forEach(span => {
    span.onclick = function () {
      if (!uid) {
        
        return;
      }

      const emoji = this.textContent.trim().slice(0, 2);
      const alreadyActive = this.classList.contains('active');

      // إزالة الكل
      spans.forEach(s => s.classList.remove('active'));

      if (alreadyActive) {
        // ⛔ حذف الريأكشن لو ضغط تاني
        firebase.database().ref("reactions/" + postId + "/" + uid).remove()
          .then(() => {
            console.log("🗑️ تم حذف التفاعل");
            countPostReactions(postId, card);
          });
      } else {
        // ✅ تفعيل التفاعل الجديد
        this.classList.add('active');

        // ✅ حفظه في فايربيز
        firebase.database().ref("reactions/" + postId + "/" + uid).set(emoji)
          .then(() => {
            console.log(`✅ تم حفظ التفاعل: ${emoji}`);
            countPostReactions(postId, card);
          });
      }

      // ✅ أنيميشن بسيط (هزة)
      this.style.animation = 'shake 0.9s';
      setTimeout(() => {
        this.style.animation = '';
      }, 900);
    };
  });
}

// ✅ دالة لحساب عدد التفاعلات الفعلي لكل إيموجي
function countPostReactions(postId, card) {
  const emojiCounts = {}; // { 😂: 2, 👎: 1 }

  firebase.database().ref("reactions/" + postId).once("value")
    .then(snapshot => {
      snapshot.forEach(userSnap => {
        const reaction = userSnap.val(); // دا الـ emoji مباشرة
        if (reaction) {
          emojiCounts[reaction] = (emojiCounts[reaction] || 0) + 1;
        }
      });

      // ✅ تحديث DOM داخل الكارت
      const spans = card.querySelectorAll('.reactions span');
      spans.forEach(span => {
        const emoji = span.textContent.trim().slice(0, 2);
        const count = emojiCounts[emoji] || 0;
        const countSpan = span.querySelector('.count');
        if (countSpan) {
          countSpan.textContent = count;
        }
      });
    });
}
  // إعداد Firebase
  
  const db = firebase.database();
  const contentContainer = document.querySelector('.container01');

  // جلب البيانات من Firebase
  db.ref("memes").on("value", snapshot => {
    const memes = snapshot.val();
    for (let key in memes) {
      const meme = memes[key];
      const card = document.createElement("div");
      card.className = "meme-container";
      card.setAttribute("data-type", meme.type || "Memes");

      // بناء الميديا
      let mediaElement = '';
      if (meme.media.endsWith(".mp4")) {

        mediaElement = `
          <div class="custom-video-player">
            <div class="watermark">شبكة الضحك المصرية</div>
            <video class="customVideo" src="${meme.media}" ${meme.poster ? `poster="${meme.poster}"` : ''}></video>
            <div class="controls">
              <button class="playPause"><i class="fa fa-play"></i></button>
              <input type="range" class="seekBar" value="0">
              <button class="restart"><i class="fa fa-refresh"></i></button>
              <button class="fullscreen"><i class="fa fa-expand"></i></button>
            </div>
          </div>
        `;
      } else if (meme.media.endsWith(".m4a") || meme.media.endsWith(".mp3")) {
  mediaElement = `
    <div class="custom-audio-player">
      <div class="audio-title">🎵 ريكورد صوتي</div>
      <audio class="customAudio" src="${meme.media}"></audio>
      <div class="controls-audio">
        <button class="audioPlayPause"><i class="fa fa-play"></i></button>
        <input type="range" class="audioSeekBar" value="0">
        <span class="currentTime">00:00</span>/<span class="duration">00:00</span>
      </div>
    </div>
  `;

      } else {
        mediaElement = `<img src="${meme.media}" alt="meme">`;
      }

      card.innerHTML = `
        <div class="about-publisher">
          <div class="username">${meme.username}</div>
          <img class="photo" src="${meme.photo}" alt="">
        </div>
        
        
        ${mediaElement}
        <div class="description">${meme.description}</div>
        <div class="meme-actions">
          <button><i class="fa fa-bookmark"></i> مفضلة</button>
          <div class="reactions">
          
            <span style="margin-right: 15px;">👎 <span class="count" style="font-size: 10px;">0</span></span>
            
              <span>😂 <span class="count" style="font-size: 10px;">0</span></span>
          </div>
          <button onclick="downloadFile('${meme.media}', 'meme.png')"><i class="fa fa-download"></i> تحميل</button>
        </div>
      `;

      // ✅ ربط اسم المستخدم وصورته بصفحة البروفايل
      
     
      
var usernameEl = card.querySelector(".username");
var photoEl = card.querySelector(".photo");

if (usernameEl && photoEl) {
  const userkey = meme.key; // مفتاح المستخدم اللي ظاهر في الكارت
  const uid = localStorage.getItem("uid"); // uid للمستخدم الحالي المسجل دخوله
 
  // لما يضغط على الاسم
  usernameEl.addEventListener("click", function() {
    if (uid && uid === userkey) {
      // لو هو نفس المستخدم يروح لصفحته الخاصة
      window.location.href = "my-profile.html";
    } else {
      // غيره، يروح لصفحة عامة
      window.location.href = "profile.html?private-key=" + userkey;
    }
  });

  // نفس الكلام على الصورة
  photoEl.addEventListener("click", function() {
    if (uid && uid === userkey) {
    
      window.location.href = "my-profile.html";
    } else {
      window.location.href = "profile.html?private-key=" + userkey;
    }
  });
}

contentContainer.appendChild(card);

setupReactions(card, key);       // تفاعلات
setupVideoPlayer(card);     
setupAudioPlayer(card);     // تشغيل فيديو
setupPosterIfMissing(card, meme); // توليد poster تلقائي
    }
  });
  

  // التفاعلات وتسجيلها في Firebase
  

  // مشغل الفيديو للكارت الواحد
  function setupVideoPlayer(card) {
    const video = card.querySelector('.customVideo');
    if (!video) return;

    const playPauseBtn = card.querySelector('.playPause');
    const seekBar = card.querySelector('.seekBar');
    const restartBtn = card.querySelector('.restart');
    const fullscreenBtn = card.querySelector('.fullscreen');

    
    playPauseBtn.addEventListener('click', () => {
  if (video.paused) {

    // 🛑 أوقف أي فيديو تاني شغال
    document.querySelectorAll('video').forEach(v => {
      if (v !== video && !v.paused) {
        v.pause();

        // 🛠️ غير شكل زر التشغيل للفيديو اللي توقف
        const otherPlayer = v.closest('.custom-video-player');
        if (otherPlayer) {
          const otherBtn = otherPlayer.querySelector('.playPause');
          if (otherBtn) {
            otherBtn.innerHTML = '<i class="fa fa-play"></i>';
          }
        }
      }
    });

    // ✅ شغّل الفيديو الحالي
    video.play();
    playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';

  } else {
    // ⏸️ وقف الفيديو الحالي
    video.pause();
    playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
  }
});

    video.addEventListener('loadedmetadata', () => {
      seekBar.max = video.duration;
    });

    video.addEventListener('timeupdate', () => {
      seekBar.value = video.currentTime;
    });

    seekBar.addEventListener('input', () => {
      video.currentTime = parseFloat(seekBar.value);
    });

    restartBtn.addEventListener('click', () => {
      video.currentTime = 0;
      video.play();
      playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
    });

    fullscreenBtn.addEventListener('click', () => {
      const player = video.parentElement;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        player.requestFullscreen();
      }
    });
  }

  // توليد بوستر من أول فريم لو مش موجود
  function setupPosterIfMissing(card, meme) {
    if (meme.poster) return;
    const video = card.querySelector('.customVideo');
    if (!video) return;

    video.addEventListener('loadeddata', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const posterUrl = canvas.toDataURL('image/jpeg');
        video.setAttribute('poster', posterUrl);
        
      } catch (e) {
        
      }
    }, { once: true });
  }
function setupAudioPlayer(card) {
  const player = card.querySelector('.custom-audio-player');
  if (!player) return;

  const audio = player.querySelector('.customAudio');
  const playPauseBtn = player.querySelector('.audioPlayPause');
  const seekBar = player.querySelector('.audioSeekBar');
  const currentTimeEl = player.querySelector('.currentTime');
  const durationEl = player.querySelector('.duration');

  // تشغيل/إيقاف
  playPauseBtn.addEventListener('click', () => {
    // وقف أي صوت تاني
    document.querySelectorAll('audio').forEach(a => {
      if (a !== audio) {
        a.pause();
        const otherPlayer = a.closest('.custom-audio-player');
        if (otherPlayer) {
          const btn = otherPlayer.querySelector('.audioPlayPause');
          if (btn) btn.innerHTML = '<i class="fa fa-play"></i>';
        }
      }
    });

    if (audio.paused) {
      audio.play();
      playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
    } else {
      audio.pause();
      playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
    }
  });

  // تحديث شريط التقدم
  audio.addEventListener('timeupdate', () => {
    seekBar.value = (audio.currentTime / audio.duration) * 100 || 0;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  // بعد تحميل الصوت
  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  // تحريك شريط التقدم
  seekBar.addEventListener('input', () => {
    const seekTo = (seekBar.value / 100) * audio.duration;
    audio.currentTime = seekTo;
  });

  function formatTime(time) {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
}
  // تحميل ملف
  function downloadFile(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  }
  
