const formLogin = document.querySelector("#login")
const inputUsername = document.querySelector("#username")
const inputPassword = document.querySelector("#password")
const notifPesan = document.querySelector("#notif")

// Contoh penggunaan untuk menangani sebuah event submit form (modul 5 & 6)
formLogin.addEventListener("submit", (r) => {
    // r merupakan parameter yang kamu buat
    // function dibawah digunakan untuk mencegah form reload/dikirim otomatis
    r.preventDefault();

    const username = inputUsername.value.trim();
    const password = inputPassword.value.trim();

    //kondisi percabangan untuk username harus berisi 6 karakter
    if(username === "" || password === ""){
        tampilkanPesan("Username dan Password tidak boleh kosong!", "red");
        return;
    }

    if(username.length !== 6){
        tampilkanPesan("Username harus berisi tepat 6 karakter!", "redd");
        return;
    }

    if(password.length < 6 || password.length > 8){
        tampilkanPesan("Password harus berada diantara 6-8 karakter!", "red");
        return;
    }

    if(username === "MHS001" && password === "12345"){
        tampilkanPesan("Login berhasil", "green");
    } else {
        tampilkanPesan("Login gagal! Username atau Password salah!" ,"red")
    }
});

function tampilkanPesan(pesan, warna){
    notifPesan.textContent = pesan;
    notifPesan.style.color = warna;
    notifPesan.style.fontWeight = "bold";
}