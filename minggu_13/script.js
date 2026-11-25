"use strict";

/* =============================================================
    PROFIL RAFAEL ARSENIO SUWANDI — SCRIPT.JS
   ============================================================= */

// ==========================================================
// 0. MODUL 12 — MODE PENGUNJUNG (UX SAJA, BUKAN KEAMANAN)
// ==========================================================
// Tugas Mandiri 3: tombol Hapus artikel dan form komentar disembunyikan bagi

if (!sudahLogin()) document.body.classList.add("pengunjung");

// 1. Inisialisasi & Sinkronisasi Tema Gelap dari localStorage
const tombolTema = document.querySelector("#btn-tema");

function muatPreferensiTema() {
    const tema = localStorage.getItem("tema");
    if (tema === "dark") {
        document.body.classList.add("dark-mode");
    }
}
muatPreferensiTema();

if (tombolTema) {
    tombolTema.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const temaSekarang = document.body.classList.contains("dark-mode") ? "dark" : "light";
        localStorage.setItem("tema", temaSekarang);
    });
}

// 2. Tombol tampilkan/sembunyikan aside
const tombolInfo = document.querySelector("#btn-info");
const kotakAside = document.querySelector("aside");

function muatPreferensiAside() {
    const statusAside = localStorage.getItem("aside_tersembunyi");
    if (statusAside === "true" && kotakAside) {
        kotakAside.classList.add("tersembunyi");
    }
}
muatPreferensiAside();

if (tombolInfo && kotakAside) {
    tombolInfo.addEventListener("click", () => {
        kotakAside.classList.toggle("tersembunyi");
        const isHidden = kotakAside.classList.contains("tersembunyi");
        localStorage.setItem("aside_tersembunyi", isHidden);
    });
}


// ==========================================================
// 3. MODUL 8: FETCH API & JSON (MENGGANTI ARTIKEL DARI SERVER)
// ==========================================================
const containerArtikel = document.querySelector(".daftar-artikel");

// Fungsi helper simpan Like (Modul 7)
function simpanLike(judulArtikel, jumlah) {
    const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};
    semuaLike[judulArtikel] = jumlah;
    localStorage.setItem("semuaLike", JSON.stringify(semuaLike));
}

async function muatArtikelDariAPI() {
    const loading = document.querySelector("#loading");
    if (loading) loading.style.display = "flex"; // Tampilkan spinner loading

    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
        
        if (!response.ok) {
            throw new Error("Status: " + response.status);
        }

        const daftarPost = await response.json();
        const semuaLikeTersimpan = JSON.parse(localStorage.getItem("semuaLike")) || {};

        if (containerArtikel) {
            containerArtikel.innerHTML = ""; // Bersihkan kontainer

            daftarPost.forEach((post) => {
                const article = document.createElement("article");

                const judul = document.createElement("h3");
                judul.textContent = post.title;

                const isi = document.createElement("p");
                isi.textContent = post.body;

                let jumlahLike = semuaLikeTersimpan[post.title] || 0;
                const tombolLike = document.createElement("button");
                tombolLike.textContent = `Like (${jumlahLike})`;
                tombolLike.style.marginRight = "8px";

                const tombolHapus = document.createElement("button");
                tombolHapus.textContent = "Hapus";
                tombolHapus.classList.add("khusus-login"); // Modul 12: disembunyikan bagi pengunjung

                article.appendChild(judul);
                article.appendChild(isi);
                article.appendChild(tombolLike);
                article.appendChild(tombolHapus);

                containerArtikel.appendChild(article);
            });
        }

    } catch (error) {
        if (containerArtikel) {
            containerArtikel.innerHTML = "<p>Gagal memuat artikel dari server, silakan periksa koneksi internet Anda.</p>";
        }
        console.error("Gagal mengambil data:", error);
    } finally {
        if (loading) loading.style.display = "none"; // Sembunyikan spinner loading
    }
}

if (containerArtikel) {
    muatArtikelDariAPI();

    // Event Delegation untuk Artikel (Like & Hapus)
    containerArtikel.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
            if (e.target.textContent.startsWith("Like")) {
                const judulArtikel = e.target.closest("article").querySelector("h3").textContent;
                
                let match = e.target.textContent.match(/\d+/);
                let jumlah = match ? parseInt(match[0]) : 0;
                jumlah++;

                e.target.textContent = `Like (${jumlah})`;
                simpanLike(judulArtikel, jumlah);
            }
            else if (e.target.textContent === "Hapus") {
                e.target.closest("article").remove();
            }
        }
    });

    containerArtikel.addEventListener("mouseover", (e) => {
        const article = e.target.closest("article");
        if (article) article.classList.add("artikel-hover");
    });

    containerArtikel.addEventListener("mouseout", (e) => {
        const article = e.target.closest("article");
        if (article) article.classList.remove("artikel-hover");
    });
}


// ==========================================================
// 4. FORM KOMENTAR DENGAN LOCALSTORAGE (Modul 7)
// ==========================================================
const formKomentar = document.querySelector("#form-komentar");
const daftarKomentar = document.querySelector("#daftar-komentar");
const elemenError = document.querySelector("#pesan-error");
const btnHapusSemua = document.querySelector("#btn-hapus-semua");
const btnTop = document.querySelector("#btn-top");

function simpanKomentar(nama, pesan) {
    const daftar = JSON.parse(localStorage.getItem("komentar")) || [];
    daftar.push({ nama, pesan });
    localStorage.setItem("komentar", JSON.stringify(daftar));
}

function muatKomentar() {
    if (!daftarKomentar) return;
    daftarKomentar.innerHTML = "";
    
    const daftar = JSON.parse(localStorage.getItem("komentar")) || [];
    
    daftar.forEach((k, index) => {
        const li = document.createElement("li");
        
        const teks = document.createElement("span");
        teks.textContent = `${k.nama}: ${k.pesan}`;

        const btnHapusSatu = document.createElement("button");
        btnHapusSatu.textContent = "Hapus";
        btnHapusSatu.classList.add("btn-hapus-komentar", "khusus-login"); // Modul 12
        btnHapusSatu.dataset.id = index;

        li.appendChild(teks);
        li.appendChild(btnHapusSatu);
        daftarKomentar.appendChild(li);
    });

    if (daftar.length > 0 && btnHapusSemua) {
        btnHapusSemua.style.display = "inline-block";
    } else if (btnHapusSemua) {
        btnHapusSemua.style.display = "none";
    }
}

if (formKomentar && daftarKomentar) {
    muatKomentar();

    formKomentar.addEventListener("submit", (e) => {
        e.preventDefault();

        const nama = document.querySelector("#input-nama").value.trim();
        const pesan = document.querySelector("#input-pesan").value.trim();

        if (pesan.length < 5) {
            elemenError.textContent = "Pesan komentar terlalu pendek (minimal 5 karakter)!";
            elemenError.style.display = "block";
            return;
        }

        elemenError.style.display = "none";
        simpanKomentar(nama, pesan);
        muatKomentar();
        formKomentar.reset();
    });

    daftarKomentar.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-hapus-komentar")) {
            const id = e.target.dataset.id;
            let daftar = JSON.parse(localStorage.getItem("komentar")) || [];
            
            daftar.splice(id, 1);
            localStorage.setItem("komentar", JSON.stringify(daftar));
            muatKomentar();
        }
    });

    if (btnHapusSemua) {
        btnHapusSemua.addEventListener("click", () => {
            localStorage.removeItem("komentar");
            muatKomentar();
            elemenError.style.display = "none";
        });
    }
}


// ==========================================================
// 5. MODUL 12 — PROFIL (/auth/me), LOGOUT & HITUNG MUNDUR SESI
// ==========================================================

/* B.4 + Tugas Mandiri 2 — foto, sapaan, dan email dari /auth/me lewat fetchAman()
   (header Authorization: Bearer ditambahkan otomatis). Isi memakai textContent. */
async function muatProfilPengguna() {
    const sapaan = document.querySelector("#sapaan");
    const email = document.querySelector("#email-profil");
    const foto = document.querySelector("#foto-profil");
    if (!sapaan) return;

    try {
        const res = await fetchAman(`${API}/auth/me`);
        if (!res.ok) throw new Error("Status: " + res.status);
        const user = await res.json();

        sapaan.textContent = `Halo, ${user.firstName}!`;
        if (email) email.textContent = user.email;
        if (foto && user.image) {
            foto.src = user.image;
            foto.alt = `Foto ${user.firstName}`;
            foto.classList.remove("tersembunyi");
        }
    } catch (error) {
        // Pada 401/403, fetchAman() sudah mengalihkan ke login.html?sesi=habis
        sapaan.textContent = "Profil tidak dapat dimuat.";
        console.error("Gagal memuat profil pengguna:", error);
    }
}
if (sudahLogin()) muatProfilPengguna();

/* B.5 — tombol Keluar */
const tombolLogout = document.querySelector("#btn-logout");
if (tombolLogout) tombolLogout.addEventListener("click", logout);

/* Opsional — hitung mundur masa berlaku token dari klaim "exp".
   Hanya untuk TAMPILAN; saat habis, pengguna diarahkan ke halaman login. */
function mulaiHitungMundur() {
    const el = document.querySelector("#sisa-sesi");
    if (!el) return;

    const data = bacaToken(ambilToken() || "");
    if (!data || !data.exp) {            // token tanpa klaim exp: sembunyikan
        el.classList.add("tersembunyi");
        return;
    }

    function format(detik) {
        const jam = Math.floor(detik / 3600);
        const menit = String(Math.floor((detik % 3600) / 60)).padStart(2, "0");
        const sisaDetik = String(detik % 60).padStart(2, "0");
        return jam > 0 ? `${jam}:${menit}:${sisaDetik}` : `${menit}:${sisaDetik}`;
    }

    let timer = null;
    function perbarui() {
        const sisa = Math.floor(data.exp - Date.now() / 1000);
        if (sisa <= 0) {
            clearInterval(timer);
            hapusToken();
            location.replace("login.html?sesi=habis");
            return;
        }
        el.textContent = `Sesi berakhir dalam ${format(sisa)}`;
    }
    perbarui();
    timer = setInterval(perbarui, 1000);
}
if (sudahLogin()) mulaiHitungMundur();


// ==========================================================
// 6. TOMBOL RESET DATA GLOBAL
// ==========================================================
const btnReset = document.querySelector("#btn-reset");
if (btnReset) {
    btnReset.addEventListener("click", () => {
        const konfirmasi = confirm("Hapus semua data tersimpan (tema, like, komentar, aside)? Anda juga akan keluar.");
        if (konfirmasi) {
            localStorage.clear();
            hapusToken();   // Modul 12: token di sessionStorage ikut dihapus
            location.reload();
        }
    });
}


// --- Tombol Kembali ke Atas ---
window.addEventListener("scroll", () => {
    if (btnTop) {
        if (window.scrollY > 200) {
            btnTop.style.display = "block";
        } else {
            btnTop.style.display = "none";
        }
    }
});

if (btnTop) {
    btnTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
};