window.addEventListener('DOMContentLoaded', fetchuserExpenses)

const expenseDiv = document.getElementById('expense-div');

async function fetchuserExpenses(e){
   e.preventDefault()

   let token = localStorage.getItem('token');
   let loadUserId = +localStorage.getItem('clickedUser')
//    
    try {
        console.log(loadUserId , token)
        let response = await axios.get(`http://54.174.108.24:3000/expense/getInfo/${loadUserId}`  ,  {headers : {'Authorization': token}} )
        
        console.log(response)
        if(response.data.success){
            response.data.data.map(data=>{
                showOnScreen(data);
            })
        }
        
    } catch (error) {
        console.log(error)
    }
}

function showOnScreen(data){
    let child = `<li class="list" >
    <span class="expense-info"> ₹ ${data.amount} - ${data.category} - ${data.description}</span>
</li>`

expenseDiv.innerHTML += child
}

