"use strict";

/* =============================================================
    PROFIL RAFAEL ARSENIO SUWANDI — SCRIPT.JS
    Terintegrasi Modul 7 (Client-side State), Modul 9 (REST API)
    & Modul 10 (Component-based UI / Custom Elements)

    Perubahan Modul 10:
      - Dark mode kini ada di komponen <tombol-tema> (komponen.js)
      - Artikel dirender sebagai <kartu-artikel> dari API (B.5)
      - Event delegation klik Like & Hapus artikel DINONAKTIFKAN;
        perilakunya ada di dalam komponen (B.6)
      - Komentar dirender sebagai <kartu-komentar> (Tugas Mandiri)
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

// 1. Dark mode: sekarang dikelola oleh komponen <tombol-tema> di komponen.js
//    (tombol, toggle class dark-mode, dan penyimpanan localStorage ada di sana)

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
// 3. MODUL 10 · B.5 — RENDER <kartu-artikel> DARI API
//    + MODUL 7 (simpan like) & MODUL 9 (PATCH like)
// ==========================================================
const wadah = document.querySelector(".daftar-artikel");

// Fungsi helper simpan Like (Modul 7)
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

async function muatArtikel() {
    if (!wadah) return;
    const loading = document.querySelector("#loading");
    if (loading) loading.style.display = "flex"; // Tampilkan spinner loading

    try {
        const res = await fetch(BASE + "/posts?_limit=5");
        if (!res.ok) throw new Error("Status: " + res.status);
        const data = await res.json();
        const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};

        wadah.replaceChildren(); // kosongkan wadah
        data.forEach((post) => {
            const kartu = document.createElement("kartu-artikel");
            kartu.setAttribute("judul", post.title);   // data API lewat atribut
            kartu.setAttribute("isi", post.body);
            kartu.setAttribute("post-id", post.id);                      // dipakai PATCH like
            kartu.setAttribute("like-awal", semuaLike[post.title] || 0); // like tersimpan (Modul 7)
            kartu.setAttribute("batas-like", 10);      // opsional B.7: Like berhenti di 10
            wadah.appendChild(kartu); // -> connectedCallback -> render()
        });
    } catch (error) {
        wadah.textContent = "Gagal memuat artikel, silakan coba lagi.";
        console.error(error);
    } finally {
        if (loading) loading.style.display = "none"; // Sembunyikan spinner loading
    }
}

if (wadah) {
    muatArtikel();

    // Event delegation klik Like & Hapus (Modul 4/6) DINONAKTIFKAN:
    // perilaku tombol kini ada di dalam <kartu-artikel>. Script ini hanya
    // mendengarkan event "like-berubah" untuk menyimpan & mengirim ke server.
    wadah.addEventListener("like-berubah", (e) => {
        simpanLike(e.detail.judul, e.detail.jumlah);                    // Modul 7: localStorage
        perbaruiLikeKeServer(e.detail.postId, e.detail.jumlah);         // Modul 9: PATCH ke server
    });

    // Efek hover kartu (Modul 5) tidak bertabrakan dengan komponen, jadi tetap dipakai
    wadah.addEventListener("mouseover", (e) => {
        const article = e.target.closest("article");
        if (article) article.classList.add("artikel-hover");
    });

    wadah.addEventListener("mouseout", (e) => {
        const article = e.target.closest("article");
        if (article) article.classList.remove("artikel-hover");
    });
}


// ==========================================================
// 4. KOMENTAR: <kartu-komentar> + REST API (POST, PATCH/Edit, DELETE)
//    localStorage tetap dipakai agar komentar tampil setelah refresh
// ==========================================================
const formKomentar = document.querySelector("#form-komentar");
const daftarKomentar = document.querySelector("#daftar-komentar");
const elemenError = document.querySelector("#pesan-error");
const btnHapusSemua = document.querySelector("#btn-hapus-semua");
const btnBatalEdit = document.querySelector("#btn-batal-edit");
const btnTop = document.querySelector("#btn-top");
const tombolKirim = formKomentar ? formKomentar.querySelector('button[type="submit"]') : null;

// Menyimpan komentar yang sedang diedit: { lokalId, id, kartu } — null kalau tidak sedang edit
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

/* Modul 10 · B.7 — komentar dirender sebagai <kartu-komentar>, bukan createElement manual */
function renderKomentar(k) {
    const kartu = document.createElement("kartu-komentar");
    kartu.setAttribute("nama", k.nama);     // data pengguna lewat atribut -> textContent di komponen
    kartu.setAttribute("pesan", k.pesan);
    kartu.dataset.id = k.id !== undefined ? k.id : "";   // id server (untuk PATCH & DELETE)
    kartu.dataset.lokalId = k.lokalId;                    // id lokal (untuk localStorage)
    daftarKomentar.appendChild(kartu);
}

function muatKomentar() {
    if (!daftarKomentar) return;
    daftarKomentar.replaceChildren();
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
function mulaiModeEdit(kartu) {
    const lokalId = kartu.dataset.lokalId;
    const k = ambilKomentar().find((item) => item.lokalId === lokalId);
    if (!k) return;

    // Kalau sebelumnya sedang mengedit komentar lain, hilangkan penandanya
    if (komentarSedangDiedit) komentarSedangDiedit.kartu.classList.remove("sedang-diedit");

    komentarSedangDiedit = { lokalId: lokalId, id: kartu.dataset.id, kartu: kartu };
    kartu.classList.add("sedang-diedit");

    document.querySelector("#input-nama").value = k.nama;
    document.querySelector("#input-pesan").value = k.pesan;
    document.querySelector("#input-pesan").focus();

    if (btnBatalEdit) btnBatalEdit.style.display = "inline-block";
    perbaruiTeksTombolKirim();
}

function akhiriModeEdit() {
    if (komentarSedangDiedit) komentarSedangDiedit.kartu.classList.remove("sedang-diedit");
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
        const { lokalId, id, kartu } = komentarSedangDiedit;
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
        // Mengganti atribut -> attributeChangedCallback -> komponen render ulang otomatis (B.4)
        kartu.setAttribute("nama", nama);
        kartu.setAttribute("pesan", pesan);
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

    /* Modul 10 · B.7 — tombol Edit & Hapus ada DI DALAM <kartu-komentar>.
       Komponen mengirim event; script.js yang menangani REST API-nya. */
    daftarKomentar.addEventListener("edit-komentar", (e) => {
        mulaiModeEdit(e.target);
    });

    /* Modul 9 · B.5 — DELETE, pesan error dari B.6 */
    daftarKomentar.addEventListener("hapus-komentar", async (e) => {
        const kartu = e.target;
        const id = kartu.dataset.id;
        const lokalId = kartu.dataset.lokalId;

        // Nonaktifkan tombol selama proses agar tidak terklik dua kali
        kartu.setMenghapus(true);

        try {
            if (id) {
                const response = await fetch(`${BASE}/comments/${id}`, { method: "DELETE" });
                if (!response.ok) throw buatErrorHttp(response, "Gagal menghapus komentar");
            }
            kartu.remove();
            simpanSemuaKomentar(ambilKomentar().filter((k) => k.lokalId !== lokalId));

            if (komentarSedangDiedit && komentarSedangDiedit.lokalId === lokalId) {
                akhiriModeEdit();
            }
            perbaruiTombolHapusSemua();
        } catch (error) {
            tampilkanError(error, "menghapus komentar");
            kartu.setMenghapus(false);
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