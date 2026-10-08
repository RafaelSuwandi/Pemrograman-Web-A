// --- 1. FITUR MODE GELAP & INFO TAMBAHAN ---
const btnTema = document.querySelector("#btn-tema");
const btnInfo = document.querySelector("#btn-info");
const infoBox = document.querySelector("#info-box");

btnTema.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    btnTema.textContent = document.body.classList.contains("dark-mode") ? "Mode Terang" : "Mode Gelap";
});

document.addEventListener("keydown", (e) => {
    if ((e.key === "d" || e.key === "D") && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        btnTema.click();
    }
});

btnInfo.addEventListener("click", () => {
    infoBox.style.display = (infoBox.style.display === "none" || infoBox.style.display === "") ? "block" : "none";
});

// --- 2. DEKLARASI ELEMEN FORM ---
const formDaftar = document.querySelector("#form-daftar");
const inputNamaLengkap = document.querySelector("#nama-lengkap");
const inputTanggalLahir = document.querySelector("#tanggal-lahir");
const inputNamaSma = document.querySelector("#nama-sma");
const inputJurusan = document.querySelector("#jurusan");
const inputUsername = document.querySelector("#username");
const inputEmail = document.querySelector("#email");
const inputPassword = document.querySelector("#password");
const inputKonfirmasi = document.querySelector("#konfirmasi");
const inputPrestasi = document.querySelector("#prestasi");

// Deklarasi Elemen Error
const errorNamaLengkap = document.querySelector("#error-nama-lengkap");
const errorTanggalLahir = document.querySelector("#error-tanggal-lahir");
const errorNamaSma = document.querySelector("#error-nama-sma");
const errorJurusan = document.querySelector("#error-jurusan");
const errorUsername = document.querySelector("#error-username");
const errorEmail = document.querySelector("#error-email");
const errorPassword = document.querySelector("#error-password");
const errorKonfirmasi = document.querySelector("#error-konfirmasi");

const pesanSukses = document.querySelector("#pesan-sukses");
const bodyTabelAkun = document.querySelector("#body-tabel-akun");
let nomorPendaftar = 1; // Counter untuk nomor di tabel

// --- 3. LOGIKA VALIDASI DINAMIS ---
function validasiFieldDinamis(input, errorElement, namaField) {
    input.setCustomValidity("");

    if (input.validity.valueMissing) {
        input.setCustomValidity(`${namaField} wajib diisi.`);
    } else if (input.validity.tooShort) {
        input.setCustomValidity(`${namaField} minimal ${input.minLength} karakter.`);
    } else if (input.validity.typeMismatch) {
        input.setCustomValidity(`Format ${namaField} tidak valid.`);
    } else if (input.validity.patternMismatch) {
        if (input.id === "nama-lengkap") {
            input.setCustomValidity(`${namaField} hanya boleh berisi huruf dan spasi.`);
        } else {
            input.setCustomValidity(`${namaField} hanya boleh berisi huruf, angka, dan garis bawah.`);
        }
    }

    if (!input.checkValidity()) {
        errorElement.textContent = input.validationMessage;
    } else {
        errorElement.textContent = "";
    }
}

// Validasi Khusus Tanggal Lahir (Tidak boleh masa depan)
inputTanggalLahir.addEventListener("input", () => {
    inputTanggalLahir.setCustomValidity("");
    const tanggalUser = new Date(inputTanggalLahir.value);
    const hariIni = new Date();

    if (inputTanggalLahir.validity.valueMissing) {
        inputTanggalLahir.setCustomValidity("Tanggal lahir wajib diisi.");
    } else if (tanggalUser > hariIni) {
        inputTanggalLahir.setCustomValidity("Tanggal lahir tidak boleh di masa depan.");
    }

    if (!inputTanggalLahir.checkValidity()) {
        errorTanggalLahir.textContent = inputTanggalLahir.validationMessage;
    } else {
        errorTanggalLahir.textContent = "";
    }
});

// Event Listener Field Dasar
inputNamaLengkap.addEventListener("input", () => validasiFieldDinamis(inputNamaLengkap, errorNamaLengkap, "Nama Lengkap"));
inputNamaSma.addEventListener("input", () => validasiFieldDinamis(inputNamaSma, errorNamaSma, "Asal SMA"));
inputJurusan.addEventListener("change", () => validasiFieldDinamis(inputJurusan, errorJurusan, "Jurusan"));
inputUsername.addEventListener("input", () => validasiFieldDinamis(inputUsername, errorUsername, "Username"));
inputEmail.addEventListener("input", () => validasiFieldDinamis(inputEmail, errorEmail, "Email"));
inputPassword.addEventListener("input", () => validasiFieldDinamis(inputPassword, errorPassword, "Password"));

// Validasi Khusus Konfirmasi Password
inputKonfirmasi.addEventListener("input", () => {
    inputKonfirmasi.setCustomValidity("");
    
    if (inputKonfirmasi.validity.valueMissing) {
        inputKonfirmasi.setCustomValidity("Konfirmasi Password wajib diisi.");
    } else if (inputKonfirmasi.value !== inputPassword.value) {
        inputKonfirmasi.setCustomValidity("Konfirmasi password tidak cocok.");
    }

    if (!inputKonfirmasi.checkValidity()) {
        errorKonfirmasi.textContent = inputKonfirmasi.validationMessage;
    } else {
        errorKonfirmasi.textContent = "";
    }
});

// --- 4. EVENT SUBMIT: MENAMBAH KE TABEL AKUN ---
formDaftar.addEventListener("submit", (e) => {
    // Validasi ulang saat disubmit
    if (inputPassword.value !== inputKonfirmasi.value) {
        e.preventDefault();
        inputKonfirmasi.setCustomValidity("Konfirmasi password tidak cocok.");
        errorKonfirmasi.textContent = inputKonfirmasi.validationMessage;
    } else if (!formDaftar.checkValidity()) {
        e.preventDefault(); 
    } else {
        e.preventDefault(); // Cegah reload halaman

        // Ambil nilai prestasi, jika kosong isi dengan strip "-"
        let teksPrestasi = inputPrestasi.value.trim() !== "" ? inputPrestasi.value : "-";

        // Buat baris baru (tr) untuk tabel
        const barisBaru = document.createElement("tr");
        barisBaru.innerHTML = `
            <td>${nomorPendaftar}</td>
            <td>${inputNamaLengkap.value}</td>
            <td>${inputUsername.value}</td>
            <td>${inputNamaSma.value}</td>
            <td>${inputJurusan.value}</td>
            <td>${teksPrestasi}</td>
        `;

        // Masukkan baris baru ke dalam tbody tabel
        bodyTabelAkun.appendChild(barisBaru);
        nomorPendaftar++; // Naikkan nomor urut

        // Munculkan pesan sukses
        pesanSukses.style.display = "block";
        formDaftar.reset(); // Kosongkan form
        
        // Sembunyikan pesan sukses setelah 3 detik
        setTimeout(() => {
            pesanSukses.style.display = "none";
        }, 3000);
    }
});