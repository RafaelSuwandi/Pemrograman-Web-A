"use strict";

/* =============================================================
    PROFIL RAFAEL ARSENIO SUWANDI — SCRIPT.JS
    Disesuaikan dengan Standar Modul 7 (Client-side State Praktikum)
   ============================================================= */

// ==========================================================
// 1. LANGKAH 1 & 2: PREFERENSI TEMA GELAP (DARK MODE)
// ==========================================================
const tombolTema = document.querySelector("#btn-tema");

function muatPreferensiTema() {
    const tema = localStorage.getItem("tema"); // Sesuai Langkah 2 modul
    if (tema === "dark") {
        document.body.classList.add("dark-mode");
    }
}
muatPreferensiTema(); // Dijalankan saat awal skrip dimuat[cite: 12]

if (tombolTema) {
    tombolTema.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        
        // Sesuai Langkah 1 modul: simpan status terkini[cite: 12]
        const temaSekarang = document.body.classList.contains("dark-mode") ? "dark" : "light";
        localStorage.setItem("tema", temaSekarang);
    });
}


// ==========================================================
// 2. TUGAS MANDIRI B.7: STATUS ASIDE (INFO TAMBAHAN)
// ==========================================================
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
        // Simpan status aside ke localStorage agar teringat setelah refresh[cite: 12]
        const isHidden = kotakAside.classList.contains("tersembunyi");
        localStorage.setItem("aside_tersembunyi", isHidden);
    });
}


// ==========================================================
// 3. LANGKAH 3: MENYIMPAN & MEMUAT JUMLAH LIKE PER ARTIKEL
// ==========================================================
const daftarArtikel = [
    {
        judul: "Mengenal HTML Semantik",
        tanggal: "2026-08-20",
        isi: "HTML semantik membantu membangun struktur halaman yang bermakna...",
    },
    {
        judul: "Dasar CSS Responsif",
        tanggal: "2026-08-22",
        isi: "CSS responsif memastikan tampilan menyesuaikan berbagai layar...",
    },
    {
        judul: "Mengenal JavaScript dan DOM",
        tanggal: "2026-08-24",
        isi: "JavaScript memungkinkan halaman web menjadi interaktif...",
    },
];

const containerArtikel = document.querySelector(".daftar-artikel");

// Fungsi helper simpan Like sesuai Langkah 3 modul[cite: 12]
function simpanLike(judulArtikel, jumlah) {
    const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};
    semuaLike[judulArtikel] = jumlah;
    localStorage.setItem("semuaLike", JSON.stringify(semuaLike));
}

if (containerArtikel) {
    // Ambil data semuaLike dari localStorage saat render
    const semuaLikeTersimpan = JSON.parse(localStorage.getItem("semuaLike")) || {};

    daftarArtikel.forEach((data) => {
        const article = document.createElement("article");

        const judul = document.createElement("h3");
        judul.textContent = data.judul;

        const waktu = document.createElement("time");
        waktu.textContent = data.tanggal;

        const isi = document.createElement("p");
        isi.textContent = data.isi;

        // Ambil jumlah like berdasarkan judul artikel (Sesuai Langkah 3)[cite: 12]
        let jumlahLike = semuaLikeTersimpan[data.judul] || 0;

        const tombolLike = document.createElement("button");
        tombolLike.textContent = `Like (${jumlahLike})`;
        tombolLike.style.marginRight = "8px";

        const tombolHapus = document.createElement("button");
        tombolHapus.textContent = "Hapus";

        article.appendChild(judul);
        article.appendChild(waktu);
        article.appendChild(isi);
        article.appendChild(tombolLike);
        article.appendChild(tombolHapus);

        containerArtikel.appendChild(article);
    });

    // Event Delegation untuk Artikel (Like & Hapus)
    containerArtikel.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
            if (e.target.textContent.startsWith("Like")) {
                const judulArtikel = e.target.closest("article").querySelector("h3").textContent;
                
                // Hitung jumlah like saat ini dari teks tombol
                let match = e.target.textContent.match(/\d+/);
                let jumlah = match ? parseInt(match[0]) : 0;
                jumlah++;

                e.target.textContent = `Like (${jumlah})`;
                simpanLike(judulArtikel, jumlah); // Simpan ke localStorage[cite: 12]
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
// 4. LANGKAH 4: MENYIMPAN & MEMUAT KOMENTAR (FORMAT JSON)
// ==========================================================
const formKomentar = document.querySelector("#form-komentar");
const daftarKomentar = document.querySelector("#daftar-komentar");
const elemenError = document.querySelector("#pesan-error");
const btnHapusSemua = document.querySelector("#btn-hapus-semua");
const btnTop = document.querySelector("#btn-top");

// Fungsi simpan komentar ke array localStorage (Sesuai Langkah 4)[cite: 12]
function simpanKomentar(nama, pesan) {
    const daftar = JSON.parse(localStorage.getItem("komentar")) || [];
    daftar.push({ nama, pesan });
    localStorage.setItem("komentar", JSON.stringify(daftar));
}

// Fungsi render ulang daftar komentar ke DOM[cite: 12]
function muatKomentar() {
    if (!daftarKomentar) return;
    daftarKomentar.innerHTML = "";
    
    const daftar = JSON.parse(localStorage.getItem("komentar")) || [];
    
    daftar.forEach((k, index) => {
        const li = document.createElement("li");
        
        const teks = document.createElement("span");
        teks.textContent = `${k.nama}: ${k.pesan}`;

        // Tombol hapus satuan yang memperbarui localStorage (Tugas Mandiri)
        const btnHapusSatu = document.createElement("button");
        btnHapusSatu.textContent = "Hapus";
        btnHapusSatu.classList.add("btn-hapus-komentar");
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
    muatKomentar(); // Jalankan saat halaman dimuat[cite: 12]

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

        simpanKomentar(nama, pesan); // Simpan via fungsi modular[cite: 12]
        muatKomentar(); // Render ulang DOM

        formKomentar.reset();
    });

    // Hapus komentar satuan dan update localStorage
    daftarKomentar.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-hapus-komentar")) {
            const id = e.target.dataset.id;
            let daftar = JSON.parse(localStorage.getItem("komentar")) || [];
            
            daftar.splice(id, 1); // Hapus elemen dari array
            localStorage.setItem("komentar", JSON.stringify(daftar)); // Update storage
            muatKomentar(); // Render ulang
        }
    });

    // Hapus seluruh komentar
    if (btnHapusSemua) {
        btnHapusSemua.addEventListener("click", () => {
            localStorage.removeItem("komentar");
            muatKomentar();
            elemenError.style.display = "none";
        });
    }
}


// ==========================================================
// 5. LANGKAH 5: TOMBOL RESET DATA GLOBAL
// ==========================================================
// Tambahkan elemen tombol reset di bagian footer index.html kamu:
// <button id="btn-reset">Reset Semua Data</button>

const btnReset = document.querySelector("#btn-reset");
if (btnReset) {
    btnReset.addEventListener("click", () => {
        const konfirmasi = confirm("Hapus semua data tersimpan (tema, like, komentar, aside)?");
        if (konfirmasi) {
            localStorage.clear(); // Menghapus seluruh isi localStorage[cite: 12]
            location.reload();    // Muat ulang halaman ke kondisi awal[cite: 12]
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