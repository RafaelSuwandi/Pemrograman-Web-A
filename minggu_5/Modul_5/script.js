"use strict";

/* =============================================================
    MODUL 3 — JAVASCRIPT DASAR DAN DOM
    Bagian B — Kegiatan Praktikum (skrip lengkap: script.js)
    Mata Kuliah: Pemrograman Berbasis Web (PROG31W)

    Cara pakai:
    Tautkan file ini tepat sebelum </body> pada index.html:
        <script src="script.js"></script>

    Elemen HTML yang diharapkan ada di index.html:
        - <header> berisi <h1>, tombol #btn-tema, dan tombol #btn-info
        - <aside> (kotak info tambahan)
        - container artikel dengan class .daftar-artikel  (dikosongkan di
        HTML — isinya dirender oleh JavaScript di Langkah 4)

    Kelas CSS pendukung di style.css:
        - body.dark-mode   (tema gelap)
        - .tersembunyi      (display: none)

    Catatan: setiap fitur dibungkus pengecekan keberadaan elemen
    (if (elemen) { ... }) agar skrip tetap berjalan meski salah satu
    bagian HTML belum ditambahkan.
   ============================================================= */


/* ---------- B.2 — Langkah 1: Variabel dan seleksi elemen dasar ----------
    Menyeleksi elemen dari halaman dan menampilkannya di Console
    untuk memastikan koneksi JavaScript <-> HTML berjalan.
   (Buka browser, tekan F12, lihat tab Console.)                         */
const judulSitus = document.querySelector("header h1");

if (judulSitus) {
  console.log(judulSitus);              // elemen <h1>-nya
  console.log(judulSitus.textContent);  // teks judul situs
}


/* ---------- B.3 — Langkah 2: Fungsi dan tombol Dark Mode ----------
    Menekan tombol #btn-tema akan menamb/menghapus class "dark-mode"
   pada <body> (classList.toggle).                                   */
const tombolTema = document.querySelector("#btn-tema");

function toggleTema() {
    document.body.classList.toggle("dark-mode");
}

if (tombolTema) {
    tombolTema.addEventListener("click", toggleTema);
}


/* ---------- B.4 — Langkah 3: Tombol tampilkan/sembunyikan aside ----------
    Menekan tombol #btn-info akan menampilkan/menyembunyikan <aside>
   dengan menoggle class "tersembunyi".                                   */
const tombolInfo = document.querySelector("#btn-info");
const kotakAside = document.querySelector("aside");

if (tombolInfo && kotakAside) {
    tombolInfo.addEventListener("click", () => {
    kotakAside.classList.toggle("tersembunyi");
    });
}


/* ---------- B.5 — Langkah 4: Render daftar artikel dari data JavaScript ----------
    Data artikel disimpan sebagai array of object, lalu dirender secara
    dinamis ke dalam container .daftar-artikel menggunakan createElement.
   (Artikel statis di index.html dihapus karena digantikan hasil render ini.) */
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

if (containerArtikel) {
    daftarArtikel.forEach((data) => {
    const article = document.createElement("article");

    const judul = document.createElement("h3");
    judul.textContent = data.judul;

    const waktu = document.createElement("time");
    waktu.textContent = data.tanggal;

    const isi = document.createElement("p");
    isi.textContent = data.isi;

    /* B.6 — Langkah 5: tombol hapus untuk tiap artikel */
    const tombolHapus = document.createElement("button");
    tombolHapus.textContent = "Hapus";

    article.appendChild(judul);
    article.appendChild(waktu);
    article.appendChild(isi);
    article.appendChild(tombolHapus);

    containerArtikel.appendChild(article);
    });

    /* ---------- B.6 — Langkah 5: Hapus artikel per item (event delegation) ----------
        Satu listener pada container menangani klik tombol Hapus di seluruh
     artikel, termasuk artikel yang baru ditambahkan.                          */
    containerArtikel.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
        e.target.closest("article").remove();
    }
    });
}

// =========================================
// KODE TAMBAHAN MODUL 5 (EVENT HANDLING)
// =========================================

// 1. Efek Hover pada Artikel menggunakan event mouseover dan mouseout
containerArtikel.addEventListener("mouseover", (e) => {
    const article = e.target.closest("article");
    if (article) article.classList.add("artikel-hover");
});

containerArtikel.addEventListener("mouseout", (e) => {
    const article = e.target.closest("article");
    if (article) article.classList.remove("artikel-hover");
});

// 2. Modifikasi Tombol Like (Event Delegation)
// Karena artikel dirender di kode atas, kita tangkap kliknya di sini
containerArtikel.addEventListener("click", (e) => {
    // Mengecek apakah yang diklik adalah tombol Like
    if (e.target.tagName === "BUTTON" && e.target.textContent.startsWith("Like")) {
        let jumlah = parseInt(e.target.dataset.like || 0);
        jumlah++;
        e.target.dataset.like = jumlah;
        e.target.textContent = `Like (${jumlah})`;
    }
});

// PENTING: Untuk menampilkan tombol like di artikel yang sudah ada, 
// tambahkan sisipan ini tepat setelah kode pembuatan tombol "Hapus" di Langkah 4 Modul sebelumnya:
/*
    const tombolLike = document.createElement("button");
    let jumlahLike = 0;
    tombolLike.textContent = `Like (${jumlahLike})`;
    article.appendChild(tombolLike);
*/

// ===================================================
// KODE TUGAS PRAKTIKUM MANDIRI (MODUL 5)
// ===================================================

// Elemen pendukung form dan komentar
const formKomentar = document.querySelector("#form-komentar");
const daftarKomentar = document.querySelector("#daftar-komentar");
const elemenError = document.querySelector("#pesan-error");
const btnHapusSemua = document.querySelector("#btn-hapus-semua");
const btnTop = document.querySelector("#btn-top");

if (formKomentar && daftarKomentar) {

    // 1. Validasi Form & Render Komentar
    formKomentar.addEventListener("submit", (e) => {
        e.preventDefault(); // Mencegah reload halaman bawaan form

        const nama = document.querySelector("#input-nama").value.trim();
        const pesan = document.querySelector("#input-pesan").value.trim();

        // Validasi Tambahan: Pesan minimal 5 karakter (Menampilkan pesan error di halaman, bukan alert)
        if (pesan.length < 5) {
            elemenError.textContent = "Pesan komentar terlalu pendek (minimal 5 karakter)!";
            elemenError.style.display = "block"; // Tampilkan teks merah
            return; // Hentikan proses pembuatan komentar
        }

        // Jika validasi lolos, sembunyikan pesan error
        elemenError.style.display = "none";

        // Membuat item <li> baru untuk komentar
        const itemKomentar = document.createElement("li");

        // Membuat elemen teks komentar
        const teksKomentar = document.createElement("span");
        teksKomentar.textContent = `${nama}: ${pesan}`;

        // Tugas Mandiri: Membuat tombol hapus untuk tiap individu komentar
        const btnHapusSatu = document.createElement("button");
        btnHapusSatu.textContent = "Hapus";
        btnHapusSatu.classList.add("btn-hapus-komentar");

        // Memasukkan teks dan tombol hapus ke dalam <li>
        itemKomentar.appendChild(teksKomentar);
        itemKomentar.appendChild(btnHapusSatu);

        // Memasukkan <li> ke dalam <ul>
        daftarKomentar.appendChild(itemKomentar);

        // Tampilkan tombol "Hapus Semua" jika komentar ada
        btnHapusSemua.style.display = "inline-block";

        // Reset/kosongkan isi form
        formKomentar.reset();
    });

    // 2. Event Delegation: Menghapus komentar satu per satu
    daftarKomentar.addEventListener("click", (e) => {
        // Cek apakah elemen yang diklik adalah tombol dengan class 'btn-hapus-komentar'
        if (e.target.classList.contains("btn-hapus-komentar")) {
            e.target.closest("li").remove(); // Hapus item <li> tempat tombol tersebut berada

            // Sembunyikan tombol "Hapus Semua" jika seluruh komentar sudah kosong
            if (daftarKomentar.children.length === 0) {
                btnHapusSemua.style.display = "none";
            }
        }
    });

    // 3. Menghapus Seluruh Komentar Sekaligus
    btnHapusSemua.addEventListener("click", () => {
        daftarKomentar.innerHTML = ""; // Kosongkan seluruh elemen anak dari <ul>
        btnHapusSemua.style.display = "none"; // Sembunyikan tombolnya kembali
        elemenError.style.display = "none";
    });
}

// 4. (Opsional) Event Scroll Window: Memunculkan tombol "Kembali ke Atas"
window.addEventListener("scroll", () => {
    // Jika posisi scroll lebih dari 200px dari atas
    if (window.scrollY > 200) {
        btnTop.style.display = "block"; // Tampilkan tombol
    } else {
        btnTop.style.display = "none"; // Sembunyikan tombol
    }
});

// Event Klik pada tombol "Kembali ke Atas"
if (btnTop) {
    btnTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth" // Efek scroll halus ke paling atas
        });
    });
}