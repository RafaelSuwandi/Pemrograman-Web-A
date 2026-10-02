// Fungsionalitas kalkulator (otak dari kalkulatornya)
const display = document.getElementById("display");

function TampilkanNilai(input){
    display.value += input;
}

function clearDisplay(){
    display.value = "";
}

function hitung(){
    try{
        display.value = eval(display.value);
    }catch(error){
        display.value = "Error";
    }
}