CACON STOCK V4.4 FIXED

Da sua lai bo 4 file code chuan:
- index.html
- style.css
- firebase.js
- app.js

Nhung diem da sua/giu dung:
1. index.html nap dung Firebase compat truoc firebase.js va app.js
2. style.css la ban day du, co class .hidden, .modal, layout dashboard, watchlist, journal...
3. firebase.js khoi tao firebaseBoot dung cach va co adminUid = sq6iio2bSpOoapedYnTXRmn6zNz2
4. app.js ho tro:
   - dang nhap Firebase Email/Password
   - demo mode
   - tu tao users/{uid} neu chua co
   - journal/watchlist/patterns/settings-market
   - Trade Quality day du

Neu van khong dang nhap duoc, kiem tra them:
- Authentication > Email/Password da Enable
- User admin@gmail.com ton tai that trong Authentication
- Password dung
- Firestore Rules cho phep user da dang nhap doc/ghi

Rules toi thieu de test:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
