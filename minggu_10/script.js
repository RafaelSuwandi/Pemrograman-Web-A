"use strict";

/* =============================================================
    PROFIL RAFAEL ARSENIO SUWANDI — SCRIPT.JS
    Terintegrasi Modul 7 (Client-side State)
    & Modul 9 (Konsumsi REST API: POST, PATCH, DELETE)
   ============================================================= */

// Alamat dasar API latihan (dipakai oleh semua fetch di bawah)
const BASE = "https://jsonplaceholder.typicode.com";

/* ============ Modul 9 · B.6 — Pesan berbeda berdasarkan status code ============ */
function pesanDariStatus(status) {
    if (status === 404) return "Data tidak ditemukan di server.";
    if (status === 400) return "Data yang dikirim tidak valid.";
    if (status >= 500) return "Server sedang bermasalah, coba lagi nanti.";
    return "Terjadi kesalahan tidak terduga.";
}

// Membuat error yang membawa status code HTTP-nya (agar bisa dibaca di blok catch)
function buatErrorHttp(response, pesanDasar) {
    const error = new Error(pesanDasar + ", status: " + response.status);
    error.status = response.status;
    return error;
}

// Menampilkan alert: pakai pesanDariStatus() kalau ada status, selain itu pesan jaringan
function tampilkanError(error, aksi) {
    const penjelasan = error && error.status
        ? pesanDariStatus(error.status)
        : "Periksa koneksi internet Anda.";
    alert("Gagal " + aksi + ". " + penjelasan);
    console.error("Gagal " + aksi + ":", error);
}

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
// 3. LANGKAH 3 (MODUL 7): MENYIMPAN & MEMUAT JUMLAH LIKE PER ARTIKEL
//    + MODUL 9: LIKE JUGA DIKIRIM KE SERVER DENGAN PATCH
// ==========================================================
// Tambahan Modul 9: tiap artikel diberi id (1, 2, 3) agar bisa dipakai di PATCH /posts/id
const daftarArtikel = [
    {
        id: 1,
        judul: "Mengenal HTML Semantik",
        tanggal: "2026-08-20",
        isi: "HTML semantik membantu membangun struktur halaman yang bermakna...",
    },
    {
        id: 2,
        judul: "Dasar CSS Responsif",
        tanggal: "2026-08-22",
        isi: "CSS responsif memastikan tampilan menyesuaikan berbagai layar...",
    },
    {
        id: 3,
        judul: "Mengenal JavaScript dan DOM",
        tanggal: "2026-08-24",
        isi: "JavaScript memungkinkan halaman web menjadi interaktif...",
    },
];

const containerArtikel = document.querySelector(".daftar-artikel");

// Fungsi helper simpan Like sesuai Langkah 3 modul
function simpanLike(judulArtikel, jumlah) {
    const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};
    semuaLike[judulArtikel] = jumlah;
    localStorage.setItem("semuaLike", JSON.stringify(semuaLike));
}

/* Modul 9 · B.4 — PATCH jumlah like ke server (endpoint /posts/id sebagai simulasi) */
async function perbaruiLikeKeServer(postId, jumlahLike) {
    try {
        const response = await fetch(`${BASE}/posts/${postId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ likes: jumlahLike }),
        });
        if (!response.ok) throw buatErrorHttp(response, "Gagal memperbarui like");
        console.log("Like berhasil diperbarui di server");
    } catch (error) {
        const pesan = error.status ? pesanDariStatus(error.status) : "Kesalahan jaringan.";
        console.error("Gagal memperbarui like:", pesan, error);
    }
}

if (containerArtikel) {
    // Ambil data semuaLike dari localStorage saat render
    const semuaLikeTersimpan = JSON.parse(localStorage.getItem("semuaLike")) || {};

    daftarArtikel.forEach((data) => {
        const article = document.createElement("article");
        article.dataset.postId = data.id; // Modul 9: dipakai untuk PATCH like (B.4)

        const judul = document.createElement("h3");
        judul.textContent = data.judul;

        const waktu = document.createElement("time");
        waktu.textContent = data.tanggal;

        const isi = document.createElement("p");
        isi.textContent = data.isi;

        // Ambil jumlah like berdasarkan judul artikel (Sesuai Langkah 3)
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
                const article = e.target.closest("article");
                const judulArtikel = article.querySelector("h3").textContent;

                // Hitung jumlah like saat ini dari teks tombol
                let match = e.target.textContent.match(/\d+/);
                let jumlah = match ? parseInt(match[0]) : 0;
                jumlah++;

                e.target.textContent = `Like (${jumlah})`;
                simpanLike(judulArtikel, jumlah);                      // Modul 7: localStorage
                perbaruiLikeKeServer(article.dataset.postId, jumlah);  // Modul 9: PATCH ke server
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
// 4. MODUL 9: KOMENTAR VIA REST API (POST, PATCH/Edit, DELETE)
//    localStorage tetap dipakai agar komentar tampil setelah refresh
// ==========================================================
const formKomentar = document.querySelector("#form-komentar");
const daftarKomentar = document.querySelector("#daftar-komentar");
const elemenError = document.querySelector("#pesan-error");
const btnHapusSemua = document.querySelector("#btn-hapus-semua");
const btnBatalEdit = document.querySelector("#btn-batal-edit");
const btnTop = document.querySelector("#btn-top");
const tombolKirim = formKomentar ? formKomentar.querySelector('button[type="submit"]') : null;

// Menyimpan komentar yang sedang diedit: { lokalId, id, li } — null kalau tidak sedang edit
let komentarSedangDiedit = null;

/* ---------- Penyimpanan lokal (Modul 6/7) ---------- */
// lokalId = penanda unik di browser. Dibutuhkan karena JSONPlaceholder selalu
// membalas id yang sama (501) untuk setiap komentar baru.
function buatLokalId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function simpanSemuaKomentar(daftar) {
    localStorage.setItem("komentar", JSON.stringify(daftar));
}

function ambilKomentar() {
    const daftar = JSON.parse(localStorage.getItem("komentar")) || [];
    // Komentar lama (Modul 7) belum punya lokalId -> berikan sekarang
    let berubah = false;
    daftar.forEach((k) => {
        if (!k.lokalId) {
            k.lokalId = buatLokalId();
            berubah = true;
        }
    });
    if (berubah) simpanSemuaKomentar(daftar);
    return daftar;
}

/* ---------- Tampilan ---------- */
function perbaruiTombolHapusSemua() {
    if (!btnHapusSemua) return;
    const adaKomentar = daftarKomentar.children.length > 0;
    btnHapusSemua.style.display = adaKomentar ? "inline-block" : "none";
}

function perbaruiTeksTombolKirim() {
    if (tombolKirim) {
        tombolKirim.textContent = komentarSedangDiedit ? "Simpan Perubahan" : "Kirim";
    }
}

/* Modul 9 · B.3 / B.5 — render satu komentar; dataset.id = id dari server */
function renderKomentar(k) {
    const li = document.createElement("li");
    li.dataset.id = k.id !== undefined ? k.id : "";   // id server (untuk PATCH & DELETE)
    li.dataset.lokalId = k.lokalId;                    // id lokal (untuk localStorage)

    const teks = document.createElement("span");
    teks.classList.add("teks-komentar");
    teks.textContent = `${k.nama}: ${k.pesan}`;

    const aksi = document.createElement("span");
    aksi.classList.add("aksi-komentar");

    const tombolEdit = document.createElement("button");
    tombolEdit.textContent = "Edit";
    tombolEdit.classList.add("btn-edit-komentar");

    const tombolHapus = document.createElement("button");
    tombolHapus.textContent = "Hapus";
    tombolHapus.classList.add("btn-hapus-komentar");

    aksi.appendChild(tombolEdit);
    aksi.appendChild(tombolHapus);
    li.appendChild(teks);
    li.appendChild(aksi);
    daftarKomentar.appendChild(li);
}

function muatKomentar() {
    if (!daftarKomentar) return;
    daftarKomentar.innerHTML = "";
    ambilKomentar().forEach(renderKomentar);
    perbaruiTombolHapusSemua();
}

/* ---------- Permintaan ke server ---------- */
/* Modul 9 · B.2 — POST: kirim komentar baru */
async function kirimKomentarKeServer(nama, pesan) {
    const response = await fetch(BASE + "/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nama, body: pesan, postId: 1 }),
    });
    if (!response.ok) {
        throw buatErrorHttp(response, "Gagal mengirim komentar");
    }
    return await response.json(); // server membalas data + id baru
}

/* Modul 9 · B.7 — PATCH: perbarui isi komentar */
async function perbaruiKomentarKeServer(id, nama, pesan) {
    const response = await fetch(`${BASE}/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nama, body: pesan }),
    });
    if (!response.ok) {
        throw buatErrorHttp(response, "Gagal memperbarui komentar");
    }
    return await response.json();
}

/* ---------- Mode edit (Modul 9 · B.7) ---------- */
function mulaiModeEdit(li) {
    const lokalId = li.dataset.lokalId;
    const k = ambilKomentar().find((item) => item.lokalId === lokalId);
    if (!k) return;

    // Kalau sebelumnya sedang mengedit komentar lain, hilangkan penandanya
    if (komentarSedangDiedit) komentarSedangDiedit.li.classList.remove("sedang-diedit");

    komentarSedangDiedit = { lokalId: lokalId, id: li.dataset.id, li: li };
    li.classList.add("sedang-diedit");

    document.querySelector("#input-nama").value = k.nama;
    document.querySelector("#input-pesan").value = k.pesan;
    document.querySelector("#input-pesan").focus();

    if (btnBatalEdit) btnBatalEdit.style.display = "inline-block";
    perbaruiTeksTombolKirim();
}

function akhiriModeEdit() {
    if (komentarSedangDiedit) komentarSedangDiedit.li.classList.remove("sedang-diedit");
    komentarSedangDiedit = null;
    if (btnBatalEdit) btnBatalEdit.style.display = "none";
    formKomentar.reset();
    perbaruiTeksTombolKirim();
}

/* ---------- Penanganan form & daftar komentar ---------- */
if (formKomentar && daftarKomentar) {
    muatKomentar(); // tampilkan komentar tersimpan saat halaman dibuka

    /* Modul 9 · B.2 + B.3 — POST komentar baru, lalu tampilkan hasil respons server */
    async function prosesKomentarBaru(nama, pesan) {
        const hasil = await kirimKomentarKeServer(nama, pesan);          // B.2
        const k = {                                                       // B.3: pakai data respons server
            id: hasil.id,
            lokalId: buatLokalId(),
            nama: hasil.name,
            pesan: hasil.body,
        };
        const daftar = ambilKomentar();
        daftar.push(k);
        simpanSemuaKomentar(daftar);
        renderKomentar(k);
        perbaruiTombolHapusSemua();
        formKomentar.reset();
        console.log("Komentar tersimpan di server, id:", hasil.id);
    }

    /* Modul 9 · B.7 — PATCH komentar yang sedang diedit */
    async function prosesEditKomentar(nama, pesan) {
        const { lokalId, id, li } = komentarSedangDiedit;
        if (id) {
            await perbaruiKomentarKeServer(id, nama, pesan);
        }
        const daftar = ambilKomentar();
        const target = daftar.find((k) => k.lokalId === lokalId);
        if (target) {
            target.nama = nama;
            target.pesan = pesan;
            simpanSemuaKomentar(daftar);
        }
        li.querySelector(".teks-komentar").textContent = `${nama}: ${pesan}`;
        console.log("Komentar berhasil diperbarui di server, id:", id);
        akhiriModeEdit();
    }

    formKomentar.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nama = document.querySelector("#input-nama").value.trim();
        const pesan = document.querySelector("#input-pesan").value.trim();

        // Validasi (Modul 4-5) tetap dipertahankan
        if (pesan.length < 5) {
            elemenError.textContent = "Pesan komentar terlalu pendek (minimal 5 karakter)!";
            elemenError.style.display = "block";
            return;
        }
        elemenError.style.display = "none";

        // Indikator loading singkat: tombol dinonaktifkan agar tidak terklik dua kali
        tombolKirim.disabled = true;
        tombolKirim.textContent = "Mengirim...";

        const sedangEdit = komentarSedangDiedit !== null;
        try {
            if (sedangEdit) {
                await prosesEditKomentar(nama, pesan);
            } else {
                await prosesKomentarBaru(nama, pesan);
            }
        } catch (error) {
            tampilkanError(error, sedangEdit ? "memperbarui komentar" : "mengirim komentar");
        } finally {
            tombolKirim.disabled = false;
            perbaruiTeksTombolKirim();
        }
    });

    if (btnBatalEdit) {
        btnBatalEdit.addEventListener("click", akhiriModeEdit);
    }

    /* Modul 9 · B.5 — DELETE via event delegation (+ tombol Edit), pesan error dari B.6 */
    daftarKomentar.addEventListener("click", async (e) => {
        if (e.target.tagName !== "BUTTON") return;

        const li = e.target.closest("li");

        if (e.target.classList.contains("btn-edit-komentar")) {
            mulaiModeEdit(li);
            return;
        }

        if (!e.target.classList.contains("btn-hapus-komentar")) return;

        const id = li.dataset.id;
        const lokalId = li.dataset.lokalId;

        // Nonaktifkan tombol selama proses agar tidak terklik dua kali
        e.target.disabled = true;
        e.target.textContent = "Menghapus...";

        try {
            if (id) {
                const response = await fetch(`${BASE}/comments/${id}`, { method: "DELETE" });
                if (!response.ok) throw buatErrorHttp(response, "Gagal menghapus komentar");
            }
            li.remove();
            simpanSemuaKomentar(ambilKomentar().filter((k) => k.lokalId !== lokalId));

            if (komentarSedangDiedit && komentarSedangDiedit.lokalId === lokalId) {
                akhiriModeEdit();
            }
            perbaruiTombolHapusSemua();
        } catch (error) {
            tampilkanError(error, "menghapus komentar");
            e.target.disabled = false;
            e.target.textContent = "Hapus";
        }
    });

    if (btnHapusSemua) {
        btnHapusSemua.addEventListener("click", () => {
            localStorage.removeItem("komentar");
            akhiriModeEdit();
            muatKomentar();
            elemenError.style.display = "none";
        });
    }
}


// ==========================================================
// 5. TOMBOL RESET DATA GLOBAL
// ==========================================================
const btnReset = document.querySelector("#btn-reset");
if (btnReset) {
    btnReset.addEventListener("click", () => {
        const konfirmasi = confirm("Hapus semua data tersimpan (tema, like, komentar, aside)?");
        if (konfirmasi) {
            localStorage.clear();
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