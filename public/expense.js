        
let currentlyEditingId = null;
async function OnSubmit(event){
    event.preventDefault();

    if (currentlyEditingId !== null) {
        await updateExpense();
    } else {
 const name=document.getElementById('name').value
 const price=document.getElementById('price').value
 const date=document.getElementById('date').value
 const category=document.getElementById('select').value

 const obj={
     name,
     price,
     date,
     category
 }
 console.log(obj)
 try{
   const token=localStorage.getItem('token')
     const response=await axios.post('http://localhost:2000/user/add-expense',obj,{headers:{"Authorization":token}})
     console.log(obj)
     console.log(response.data.newexpenseDetail)
     showdetails()

 }
 catch(error){
     console.log(error)
 }      
}
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function showPremiumUserMessage(){
    document.getElementById('premiumbtn').style.visibility="hidden";
                document.getElementById('message').innerHTML="You are a premium user"
                document.getElementById('message').style.color='white'
            
}


async function showdetails() {
    try {        
        const token=localStorage.getItem('token')
        const decodeToken=parseJwt(token)
        const ispremiumuser=decodeToken.ispremiumuser
        if(ispremiumuser){
            showPremiumUserMessage()
            showLeaderboard()
        }
        console.log(decodeToken)
        const response = await axios.get('http://localhost:2000/user/get-expense',{headers:{"Authorization":token}});
        const data = response.data.allExpenses;
        const tableBody = document.getElementById('expense-table-body');
        tableBody.innerHTML = '';

        data.forEach(object => {
            const row = document.createElement('tr');
            

            const nameCell = document.createElement('td');
            nameCell.textContent = object.Itemname;
            row.appendChild(nameCell);

            const priceCell = document.createElement('td');
            priceCell.textContent = object.price;
            row.appendChild(priceCell);

            const dateCell = document.createElement('td');
            dateCell.textContent = object.date;
            row.appendChild(dateCell);

            const categoryCell = document.createElement('td');
            categoryCell.textContent = object.category;
            row.appendChild(categoryCell);
            tableBody.appendChild(row);

    const deletebutton=document.createElement('button')
     deletebutton.type="button"
     deletebutton.textContent="delete"
     deletebutton.style.color='White'
     deletebutton.style.marginTop='5px'    
     deletebutton.style.marginLeft="15px",
     deletebutton.style.padding = '5px'
     deletebutton.classList.add('btn', 'btn-danger')
     row.appendChild(deletebutton)
     deletebutton.onclick= async ()=>{
         try{
            const token=localStorage.getItem('token')
             const response=await axios.delete(`http://localhost:2000/user/delete-expense/${object.id}`,{headers:{"Authorization":token}})
             tableBody.removeChild(row)                       
         }
         catch(error){
             console.log(error)
         }
     }  
        });
    } catch (error) {
        console.log(error);
    }
}

async function updateExpense() {
    try {
        
        const newItem = document.getElementById('item').value;
        const newPrice = document.getElementById('price').value;
        const newCategory = document.getElementById('category').value;

        const updatedObject = {
            item: newItem,
            price: newPrice,
            category: newCategory,
        };

        console.log(updatedObject);

        const response = await axios.put(`http://localhost:2000/user/update-expense/${currentlyEditingId}`, updatedObject);
        if (response.status === 200) {
            // Reset currentlyEditingId after successful update
            currentlyEditingId = null;
            showdetails();
        }
    } catch (error) {
        console.log(error);
    }
}



showdetails();

function showLeaderboard() {
    const existingButton = document.getElementById('show-leaderboard-button');
    
    if (!existingButton) {
        const inputElement = document.createElement('input');
        inputElement.type = 'button';
        inputElement.value = 'Show Leaderboard';
        inputElement.id = 'show-leaderboard-button';
        inputElement.style.marginTop = '20px';
        inputElement.style.marginBottom = '20px';
        inputElement.classList.add('btn', 'btn-warning');
        inputElement.onclick = async () => {
            const token = localStorage.getItem('token');
            const userLeaderBoardArray = await axios.get('http://localhost:2000/premium/showLeaderBoard', {
                headers: { "Authorization": token }
            });
            
            console.log(userLeaderBoardArray);
            var leaderboardElem = document.getElementById('leaderboard');
            leaderboardElem.innerHTML = '';
            leaderboardElem.innerHTML += `<h1>Leader Board</h1>`;
            
            userLeaderBoardArray.data.forEach((userDetails) => {
                leaderboardElem.innerHTML += `<li>Name - ${userDetails.name} Total Expense - ${userDetails.totalExpense}</li>`;
            });
        };
        
        const showListElement = document.getElementById('showlist');
        showListElement.innerHTML = ''; // Clear existing content
        showListElement.appendChild(inputElement);
    }
}



document.getElementById('premiumbtn').onclick = async function (e) {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:2000/purchase/premiummembership', { headers: { "Authorization": token } })
        console.log(response)
        console.log("order_id",response.data.order_id)
        var options = { 
            "key": "rzp_test_YkDwRg5fL9W1PX",
            "order_id": response.data.order.id,
            "handler": async function (response) {
                await axios.post('http://localhost:2000/purchase/updatetransactionstatus', {
                    order_id: options.order_id, // Corrected variable name from "options" to "options"
                    payment_id: response.razorpay_payment_id,
                }, { headers: { "Authorization": token } })

                alert('You are a Premium user now')
                document.getElementById('premiumbtn').style.visibility="hidden";
                document.getElementById('message').innerHTML="You are a premium user"
                document.getElementById('message').style.color='white'
                localStorage.setItem('token',res.data.token)
                showLeaderboard()
            },
        };
        const rzp1 = new Razorpay(options); // Corrected variable name from "rzpn1" to "rzp1"
        rzp1.open();
        e.preventDefault();
        rzp1.on('paymentfailed', function (response) { // Corrected variable name from "rzpn1" to "rzp1"
            console.log(response)
            alert('something went wrong')
        });
    }


   

 
        function LogOut(event){
            event.preventDefault()
            console.log("success")
            window.location.href='/index.html'  
        }
