//Following function gets values of the username and password fields and checks to see if they match a hard coded username and password 
    function authenticate(){
        var authorised;
        
        //get input values
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        //check to see if the password and username match
        if (username == "" || password == ""){
            alert("Password/Username tidak boleh kosong!")
        }
        else if (username.length !== 6) {
            alert("Username harus memiliki 6 karakter!")
        }
        else if (password.length < 6 || password.length > 8){
            alert("Password harus terdiri dari 6 hingga 8 karakter!")
        }
        else if(username == "MHS001" && password == "BasisA"){
            authorised = true;
            alert("Login Barhasil! Selamat datang " + username)
        }else{ // username or password do not match
            authorised = false;
          //alert user
            alert("Login Gagal! Cek kembali Username dan Password anda.");
        }
        //return result
        return authorised;
    }