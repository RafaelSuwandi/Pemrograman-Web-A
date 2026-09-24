function tambah() {
    var bilangan1 = parseFloat(document.getElementById("bilangan1").value);
    var bilangan2 = parseFloat(document.getElementById("bilangan2").value);
    var hasil = bilangan1 + bilangan2;
    document.getElementById("hasil").value = hasil;
}

function kurang() {
    var bilangan1 = parseFloat(document.getElementById("bilangan1").value);
    var bilangan2 = parseFloat(document.getElementById("bilangan2").value);
    var hasil = bilangan1 - bilangan2;
    document.getElementById("hasil").value = hasil;
}