This is a repository for my campus homework

Lecturer : Mr. Kartono Pinaryanto

===========================================================================================================================================
Soal dari minggu 6 Topik : Validasi Form

1. Jelaskan mengapa validasi client-side tidak boleh menjadi satu-satunya lapisan validasi pada aplikasi web!
Jawaban : 
Validasi di sisi client (browser) sangat berguna untuk memberikan pengalaman pengguna (UX) yang baik dan umpan balik yang instan. Namun, validasi ini sangat mudah ditembus, dimanipulasi melalui Inspect Element, atau dilewati jika pengguna mematikan fitur JavaScript. Oleh karena itu, validasi di sisi server wajib dilakukan sebagai lapisan keamanan utama untuk memastikan data benar-benar aman sebelum disimpan.

2. Sebutkan minimal tiga atribut validasi bawaan HTML5 beserta fungsinya masing-masing!
Jawaban : 
 Memastikan bahwa sebuah kolom (field) wajib diisi sebelum form dapat dikirim.   type (contoh: email, number): Memvalidasi otomatis format teks yang dimasukkan agar sesuai dengan aturan spesifik tipe tersebut (misalnya, memastikan ada simbol "@" pada email).   minlength / maxlength: Membatasi jumlah karakter paling sedikit dan paling banyak yang boleh diketik oleh pengguna pada sebuah kolom. 

3. Jelaskan perbedaan antara input.checkValidity() dan input.reportValidity()!
Jawaban : 
 Hanya bertugas mengecek status apakah input sudah valid atau belum dan mengembalikan nilai true atau false di dalam logika kode. Tidak ada pesan error yang muncul secara otomatis di layar.   reportValidity(): Selain mengecek status validitas, method ini juga akan langsung memerintahkan browser untuk memunculkan pesan peringatan bawaan (pop-up) ke layar pengguna jika input tersebut tidak valid.

4.Apa fungsi setCustomValidity("") (string kosong), dan mengapa penting memanggilnya kembali setelah error diperbaiki?
Jawaban : 
Memberikan nilai string kosong ("") ke dalam fungsi ini bertujuan untuk me-reset pesan error kustom, sehingga browser kembali menganggap input tersebut valid. Langkah ini sangat krusial karena jika tidak dikosongkan setelah pengguna memperbaiki kesalahannya, browser akan terus menahan input tersebut dalam status error dan form selamanya tidak akan bisa dikirim.

5. Rancang aturan validasi (beserta pseudocode) agar field “Tanggal Lahir” tidak boleh berada di masa depan.
Jawaban : 
const inputTanggal = document.querySelector("#tanggal-lahir");

inputTanggal.addEventListener("input", () => {
    // Tangkap nilai tanggal yang dimasukkan pengguna
    const tanggalUser = new Date(inputTanggal.value);
    
    // Ambil waktu hari ini
    const hariIni = new Date();

    // Reset status error terlebih dahulu
    inputTanggal.setCustomValidity("");

    // Cek apakah tanggal user berada di masa depan
    if (tanggalUser > hariIni) {
        inputTanggal.setCustomValidity("Tanggal lahir tidak boleh melewati hari ini.");
    }
});

==============================================================================================================================================

