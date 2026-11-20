"use strict";

/* =============================================================
    MODUL 11 — SHADOW DOM, TEMPLATE, SLOT & CUSTOM EVENT
    PROFIL RAFAEL ARSENIO SUWANDI — KOMPONEN.JS

    (Cadangan versi Modul 10: simpan sebagai komponen-modul10.js)

    Komponen:
      <salam-pengguna>  tetap seperti Modul 10
      <kartu-artikel>   DITULIS ULANG: Shadow DOM + template + slot +
                        :host/::slotted + custom property + event "suka"
      <daftar-artikel>  BARU: mengambil data API dan menyusun kartu
      <kartu-komentar>  Tugas Mandiri: Shadow DOM + slot nama & pesan
                        + event "hapus-komentar"
      <tombol-tema>     tetap seperti Modul 10
   ============================================================= */

// Catatan: sengaja TIDAK memakai nama "BASE" karena sudah dipakai script.js
const URL_API = "https://jsonplaceholder.typicode.com";
const KUNCI_LIKE = "semuaLike"; // kunci localStorage yang sama dengan script.js


/* ---------- B.2 — <salam-pengguna> (dibiarkan, tanpa Shadow DOM) ---------- */
class SalamPengguna extends HTMLElement {
    connectedCallback() {
        const nama = this.getAttribute("nama") || "Tamu";
        this.textContent = `Halo, ${nama}! Selamat datang di blog.`;
    }
}
customElements.define("salam-pengguna", SalamPengguna);


/* ---------- Gaya tombol bersama ----------
   CSS halaman TIDAK menembus Shadow DOM, jadi tombol di dalam komponen
   perlu gaya sendiri. Warnanya diambil dari CSS custom property agar
   tetap bisa diatur dari style.css (termasuk dark mode). */
const gayaTombolDasar = `
    button {
        cursor: pointer;
        padding: 0.4rem 0.8rem;
        border: 1px solid var(--tombol-garis, #888);
        border-radius: 6px;
        background: var(--tombol-latar, #f2f2f2);
        color: var(--tombol-teks, #1a1a1a);
        font: inherit;
        transition: background-color 0.2s, transform 0.1s;
    }
    button:hover { background: hsl(0, 0%, 45%); color: #ffffff; }
    button:active { transform: scale(0.92); }
    button:disabled { opacity: 0.6; cursor: not-allowed; pointer-events: none; }
`;


/* ---------- B.2 - B.4 — Template <kartu-artikel> ----------
   Langkah 2: judul & isi masuk lewat SLOT (bernama + default).
   Langkah 3: :host, ::slotted, dan custom property untuk tema. */
const templateKartu = document.createElement("template");
templateKartu.innerHTML = `
    <style>
        :host { display: block; }
        .kartu {
            box-sizing: border-box;
            height: 100%;
            border: 1px solid var(--kartu-garis, #ddd);
            border-radius: var(--kartu-radius, 8px);
            padding: 16px;
            background: var(--kartu-latar, transparent);
            color: var(--kartu-teks, inherit);
        }
        :host(:hover) .kartu { background: var(--kartu-hover, #eef4fb); }
        ::slotted(h3) { margin: 0 0 8px; }
        .aksi { margin-top: 12px; display: flex; gap: 8px; }
        ${gayaTombolDasar}
        .btn-hapus { background: #ff4d4d; border-color: #ff4d4d; color: #ffffff; }
        .btn-hapus:hover { background: #d63a3a; color: #ffffff; }
    </style>
    <article class="kartu">
        <slot name="judul">Tanpa judul</slot>
        <slot>Tanpa isi</slot>
        <div class="aksi">
            <button type="button" class="btn-like" part="tombol-like">Like (0)</button>
            <button type="button" class="btn-hapus" part="tombol-hapus">Hapus</button>
        </div>
    </article>`;


/* ---------- B.2 - B.5 — Komponen <kartu-artikel> ---------- */
class KartuArtikel extends HTMLElement {
    #like = 0;       // state jumlah like milik tiap kartu
    #siap = false;   // penanda: like-awal hanya dibaca SEKALI

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(templateKartu.content.cloneNode(true));

        // Listener dipasang di constructor agar tidak terpasang ganda
        const tombolLike = this.shadowRoot.querySelector(".btn-like");
        tombolLike.addEventListener("click", () => {
            this.#like++;
            this.perbaruiTombolLike();
            // B.5 — kirim CustomEvent "suka"; halaman yang memutuskan mau diapakan
            this.dispatchEvent(new CustomEvent("suka", {
                detail: { jumlah: this.#like },
                bubbles: true,   // naik ke elemen induk
                composed: true,  // boleh melewati batas shadow DOM
            }));
        });

        // Tombol Hapus (dipertahankan dari Modul 10): kartu melepas dirinya sendiri
        this.shadowRoot.querySelector(".btn-hapus")
            .addEventListener("click", () => this.remove());
    }

    connectedCallback() {
        if (!this.#siap) {
            // Tugas Mandiri 1: jumlah like tersimpan dipulihkan lewat atribut like-awal
            this.#like = Number(this.getAttribute("like-awal")) || 0;
            this.#siap = true;
        }
        this.perbaruiTombolLike();
    }

    disconnectedCallback() {
        console.log("kartu-artikel dilepas dari halaman");
    }

    // Menampilkan jumlah like + opsional atribut batas-like (Modul 10)
    perbaruiTombolLike() {
        const tombol = this.shadowRoot.querySelector(".btn-like");
        tombol.textContent = `Like (${this.#like})`;
        const batas = Number(this.getAttribute("batas-like"));
        const penuh = batas > 0 && this.#like >= batas;
        tombol.disabled = penuh;
        tombol.title = penuh ? "Batas like tercapai" : "";
    }
}
customElements.define("kartu-artikel", KartuArtikel);


/* ---------- B.6 — <daftar-artikel>: mengambil data dari API ---------- */
// Judul & isi dikirim sebagai elemen anak (slot) dan diisi lewat textContent (aman)
function buatKartu(post) {
    const semuaLike = JSON.parse(localStorage.getItem(KUNCI_LIKE)) || {};

    const kartu = document.createElement("kartu-artikel");
    const judul = document.createElement("h3");
    judul.slot = "judul";
    judul.textContent = post.title;
    const isi = document.createElement("p");
    isi.textContent = post.body;
    kartu.append(judul, isi);

    kartu.setAttribute("post-id", post.id);                        // dipakai PATCH like (Modul 9)
    kartu.setAttribute("like-awal", semuaLike[post.title] || 0);   // Tugas Mandiri 1
    kartu.setAttribute("batas-like", 10);                          // opsional Modul 10
    return kartu;
}

class DaftarArtikel extends HTMLElement {
    async connectedCallback() {
        this.tampilkanLoading();
        const batas = Number(this.getAttribute("batas")) || 5;
        try {
            const res = await fetch(`${URL_API}/posts?_limit=${batas}`);
            if (!res.ok) throw new Error("Status: " + res.status);
            const data = await res.json();
            this.replaceChildren(...data.map(buatKartu));
        } catch (error) {
            this.textContent = "Gagal memuat artikel, silakan coba lagi.";
            console.error(error);
        }
    }

    // Spinner loading milik halaman (CSS .spinner di style.css) dibuat oleh komponen
    tampilkanLoading() {
        const kotak = document.createElement("div");
        kotak.className = "spinner-container";
        const spinner = document.createElement("div");
        spinner.className = "spinner";
        const teks = document.createElement("p");
        teks.textContent = "Memuat artikel dari server...";
        teks.style.marginTop = "8px";
        teks.style.fontWeight = "bold";
        teks.style.color = "#007bff";
        kotak.append(spinner, teks);
        this.replaceChildren(kotak);
    }
}
customElements.define("daftar-artikel", DaftarArtikel);


/* ---------- B.7 Mandiri 2 — <kartu-komentar> dengan Shadow DOM ---------- */
// Slot "nama" & "pesan". Tombol Edit/Hapus mengirim event ke halaman;
// REST API (Modul 9) tetap dikerjakan script.js.
const templateKomentar = document.createElement("template");
templateKomentar.innerHTML = `
    <style>
        :host { display: block; }
        .komentar-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 6px;
            background: var(--komentar-latar, rgba(0, 0, 0, 0.03));
            border-radius: 4px;
        }
        :host(.sedang-diedit) .komentar-item { outline: 2px solid #f0ad4e; }
        .aksi-komentar { display: flex; gap: 6px; flex-shrink: 0; margin-left: 10px; }
        ${gayaTombolDasar}
        button { padding: 2px 8px; font-size: 0.8rem; }
        .btn-edit-komentar { background: #f0ad4e; border-color: #f0ad4e; color: #ffffff; }
        .btn-edit-komentar:hover { background: #d9962f; color: #ffffff; }
        .btn-hapus-komentar { background: #ff4d4d; border-color: #ff4d4d; color: #ffffff; }
        .btn-hapus-komentar:hover { background: #d63a3a; color: #ffffff; }
    </style>
    <div class="komentar-item">
        <span class="teks-komentar"><slot name="nama">Anonim</slot>: <slot name="pesan">(tanpa pesan)</slot></span>
        <span class="aksi-komentar">
            <button type="button" class="btn-edit-komentar" part="tombol-edit">Edit</button>
            <button type="button" class="btn-hapus-komentar" part="tombol-hapus">Hapus</button>
        </span>
    </div>`;

class KartuKomentar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(templateKomentar.content.cloneNode(true));

        this.shadowRoot.querySelector(".btn-edit-komentar").addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("edit-komentar", { bubbles: true, composed: true }));
        });
        this.shadowRoot.querySelector(".btn-hapus-komentar").addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("hapus-komentar", { bubbles: true, composed: true }));
        });
    }

    // Dipanggil script.js: true saat DELETE ke server berjalan, false kalau selesai/gagal
    setMenghapus(sedang) {
        const tombol = this.shadowRoot.querySelector(".btn-hapus-komentar");
        tombol.disabled = sedang;
        tombol.textContent = sedang ? "Menghapus..." : "Hapus";
    }
}
customElements.define("kartu-komentar", KartuKomentar);


/* ---------- <tombol-tema> (dibiarkan seperti Modul 10) ---------- */
// Membungkus dark mode (Modul 3) + menyimpan preferensi ke localStorage (Modul 6)
class TombolTema extends HTMLElement {
    connectedCallback() {
        if (localStorage.getItem("tema") === "dark") {
            document.body.classList.add("dark-mode");
        }
        this.render();
    }

    render() {
        this.innerHTML = `<button type="button" class="btn-tema"></button>`;
        const tombol = this.querySelector("button");
        this.perbaruiLabel(tombol);

        tombol.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const tema = document.body.classList.contains("dark-mode") ? "dark" : "light";
            localStorage.setItem("tema", tema);
            this.perbaruiLabel(tombol);
        });
    }

    perbaruiLabel(tombol) {
        const gelap = document.body.classList.contains("dark-mode");
        tombol.textContent = gelap ? "Mode Terang" : "Mode Gelap";
    }
}
customElements.define("tombol-tema", TombolTema);