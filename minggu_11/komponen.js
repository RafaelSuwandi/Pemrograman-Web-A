"use strict";

/* =============================================================
    MODUL 10 — COMPONENT-BASED UI (Custom Elements)
    PROFIL RAFAEL ARSENIO SUWANDI — KOMPONEN.JS

    Ditautkan SEBELUM script.js di index.html (B.1) agar semua
    komponen sudah terdaftar saat script.js berjalan.

    Komponen:
      <salam-pengguna>  (B.2)
      <kartu-artikel>   (B.3 - B.6 + opsional batas-like)
      <kartu-komentar>  (B.7 Tugas Mandiri)
      <tombol-tema>     (B.7 Tugas Mandiri)
    Catatan: tanpa Shadow DOM (enkapsulasi dibahas Modul 12).
   ============================================================= */


/* ---------- B.2 — Komponen pertama: <salam-pengguna> ---------- */
class SalamPengguna extends HTMLElement {
    connectedCallback() {
        const nama = this.getAttribute("nama") || "Tamu";
        this.textContent = `Halo, ${nama}! Selamat datang di blog.`;
    }
}
customElements.define("salam-pengguna", SalamPengguna);


/* ---------- B.3 - B.6 — Komponen <kartu-artikel> (bentuk lengkap) ---------- */
class KartuArtikel extends HTMLElement {
    #like = 0;       // state jumlah like milik tiap kartu (B.6)
    #siap = false;   // penanda: like-awal hanya dibaca SEKALI saat pertama masuk dokumen

    // B.4 — hanya atribut ini yang memicu attributeChangedCallback
    static get observedAttributes() {
        return ["judul", "isi", "batas-like"];
    }

    // Lifecycle: dipanggil saat elemen masuk ke dokumen (B.5)
    connectedCallback() {
        if (!this.#siap) {
            // Modul 7: jumlah like yang tersimpan dikirim script.js lewat atribut like-awal
            this.#like = Number(this.getAttribute("like-awal")) || 0;
            this.#siap = true;
        }
        this.render();
    }

    // Lifecycle: dipanggil saat elemen dilepas dari dokumen (B.6)
    disconnectedCallback() {
        console.log("kartu-artikel dilepas dari halaman");
    }

    // B.4 — render ulang saat atribut yang diamati berubah.
    // Guard isConnected: callback bisa terpanggil sebelum elemen masuk dokumen.
    attributeChangedCallback() {
        if (this.isConnected) this.render();
    }

    render() {
        // Kerangka HTML ditulis TETAP (aman dari XSS); data diisi via textContent.
        this.innerHTML = `
            <article class="kartu">
                <h3></h3>
                <p></p>
                <button type="button" class="btn-like"></button>
                <button type="button" class="btn-hapus">Hapus</button>
            </article>`;

        // Pengisian data yang AMAN: textContent, bukan innerHTML
        this.querySelector("h3").textContent = this.getAttribute("judul") ?? "";
        this.querySelector("p").textContent = this.getAttribute("isi") ?? "";

        // Tombol Like: state di field #like, tetap bertahan antar render()
        const tombolLike = this.querySelector(".btn-like");
        this.perbaruiTombolLike(tombolLike);

        tombolLike.addEventListener("click", () => {
            this.#like++;
            this.perbaruiTombolLike(tombolLike);
            // Komponen hanya MEMBERI TAHU lewat event; penyimpanan localStorage
            // dan PATCH ke server (Modul 7 & 9) dikerjakan oleh script.js
            this.dispatchEvent(new CustomEvent("like-berubah", {
                bubbles: true,
                detail: {
                    postId: this.getAttribute("post-id"),
                    judul: this.getAttribute("judul"),
                    jumlah: this.#like,
                },
            }));
        });

        // Tombol Hapus: kartu melepas dirinya sendiri dari dokumen
        this.querySelector(".btn-hapus").addEventListener("click", () => this.remove());
    }

    // Opsional B.7 — atribut batas-like: Like dinonaktifkan setelah jumlah tertentu
    perbaruiTombolLike(tombol) {
        tombol.textContent = `Like (${this.#like})`;
        const batas = Number(this.getAttribute("batas-like"));
        if (batas > 0 && this.#like >= batas) {
            tombol.disabled = true;
            tombol.title = "Batas like tercapai";
        }
    }
}
customElements.define("kartu-artikel", KartuArtikel);


/* ---------- B.7 Mandiri — Komponen <kartu-komentar> ---------- */
// Atribut: nama & pesan. Tombol Edit & Hapus ada DI DALAM komponen.
// Penghapusan/edit ke server (Modul 9) dikerjakan script.js lewat event
// "edit-komentar" dan "hapus-komentar", agar komponen tetap reusable.
class KartuKomentar extends HTMLElement {
    #sedangMenghapus = false;

    static get observedAttributes() {
        return ["nama", "pesan"];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.isConnected) this.render();
    }

    render() {
        this.innerHTML = `
            <div class="komentar-item">
                <span class="teks-komentar"></span>
                <span class="aksi-komentar">
                    <button type="button" class="btn-edit-komentar">Edit</button>
                    <button type="button" class="btn-hapus-komentar">Hapus</button>
                </span>
            </div>`;

        // Data pengguna diisi via textContent (aman), bukan innerHTML
        const nama = this.getAttribute("nama") ?? "";
        const pesan = this.getAttribute("pesan") ?? "";
        this.querySelector(".teks-komentar").textContent = `${nama}: ${pesan}`;

        this.querySelector(".btn-edit-komentar").addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("edit-komentar", { bubbles: true }));
        });
        this.querySelector(".btn-hapus-komentar").addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("hapus-komentar", { bubbles: true }));
        });

        this.terapkanStatusHapus();
    }

    // Dipanggil script.js: true saat DELETE ke server berjalan, false kalau selesai/gagal
    setMenghapus(sedang) {
        this.#sedangMenghapus = sedang;
        this.terapkanStatusHapus();
    }

    terapkanStatusHapus() {
        const tombol = this.querySelector(".btn-hapus-komentar");
        if (!tombol) return;
        tombol.disabled = this.#sedangMenghapus;
        tombol.textContent = this.#sedangMenghapus ? "Menghapus..." : "Hapus";
    }
}
customElements.define("kartu-komentar", KartuKomentar);


/* ---------- B.7 Mandiri — Komponen <tombol-tema> ---------- */
// Membungkus dark mode (Modul 3) + menyimpan preferensi ke localStorage (Modul 6)
class TombolTema extends HTMLElement {
    connectedCallback() {
        // Pulihkan preferensi tema yang tersimpan
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