"use strict";

/* =============================================================
    MODUL 12 — AUTENTIKASI CLIENT-SIDE
    PROFIL RAFAEL ARSENIO SUWANDI 

    API latihan: DummyJSON (https://dummyjson.com)
      POST /auth/login -> { accessToken, firstName, ... }
      GET  /auth/me    -> data profil (butuh header Authorization: Bearer)
    Akun uji: username "emilys", password "emilyspass".

    
   ============================================================= */

const API = "https://dummyjson.com";
const KUNCI = "token-blog";
const MASA_BERLAKU_MENIT = 60; // masa berlaku token yang diminta saat login (turunkan jadi 1 untuk menguji hitung mundur)


/* ===================== B.2 / B.7 — Penyimpanan token =====================
   Tugas Mandiri 1 ("Ingat saya"):
     dicentang -> localStorage   (bertahan setelah browser ditutup)
     tidak     -> sessionStorage (hilang saat tab ditutup)
   ambilToken() dan hapusToken() memeriksa KEDUANYA.                         */
function simpanToken(token, ingat = false) {
    hapusToken();                                   // pastikan tidak ada token ganda
    (ingat ? localStorage : sessionStorage).setItem(KUNCI, token);
}
function ambilToken() {
    return sessionStorage.getItem(KUNCI) ?? localStorage.getItem(KUNCI);
}
function hapusToken() {
    sessionStorage.removeItem(KUNCI);
    localStorage.removeItem(KUNCI);
}
function sudahLogin() {
    return ambilToken() !== null;
}


/* ===================== B.6 / Opsional — Membaca isi token (JWT) =====================
   Payload JWT hanya di-encode (Base64URL), BUKAN dienkripsi: siapa pun dapat
   membacanya. Gunakan HANYA untuk menampilkan informasi (mis. waktu kedaluwarsa),
   bukan untuk memutuskan keamanan.                                                  */
function bacaToken(token) {
    try {
        const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(payload));
    } catch {
        return null;                                // token rusak / bukan JWT
    }
}


/* ===================== B.2 — Login ===================== */
async function login(username, password, ingat = false) {
    const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, expiresInMins: MASA_BERLAKU_MENIT }),
    });
    const data = await res.json();                  // baca dulu untuk mengambil pesan error server
    if (!res.ok) throw new Error(data.message || "Login gagal");
    simpanToken(data.accessToken, ingat);
    return data;
}


/* ===================== B.5 — Logout ===================== */
function logout() {
    hapusToken();
    location.href = "login.html";
}


/* ===================== B.3 — Proteksi halaman =====================
   location.replace() agar halaman terproteksi tidak tersimpan di riwayat
   tombol Back. Halaman disembunyikan agar kontennya tidak sempat berkedip.   */
function wajibLogin() {
    if (!sudahLogin()) {
        document.documentElement.style.visibility = "hidden";
        location.replace("login.html");
        return false;
    }
    return true;
}


/* ===================== B.4 / B.5 — fetch dengan token (Bearer) =====================
   Otomatis menyertakan header Authorization dan memeriksa status 401.
   Catatan slide: bila token rusak menghasilkan 403 (bukan 401), kondisi diperluas;
   catat status mana yang muncul di tab Network pada laporan.                        */
async function fetchAman(url, opsi = {}) {
    const token = ambilToken();
    if (!token) {
        location.replace("login.html");
        throw new Error("Belum login");
    }
    const res = await fetch(url, {
        ...opsi,
        headers: { ...opsi.headers, Authorization: `Bearer ${token}` },
    });
    if (res.status === 401 || res.status === 403) { // token ditolak / kedaluwarsa
        hapusToken();
        location.replace("login.html?sesi=habis");
        throw new Error("Sesi berakhir");
    }
    return res;
}