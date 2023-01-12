window.onscroll = () =>{
  scrollFunction()
}

function scrollFunction(){
  if(document.body.scrollTop > 30 || document.documentElement.scrollTop > 30){
    document.getElementById('navbar').style.backgroundColor = 'white'
  }else{
    document.getElementById('navbar').style.backgroundColor = 'transparent'
  }
}

document.querySelector('button.navbar-toggler').addEventListener('click', (e) => {
  if( document.getElementById('navbar').style.backgroundColor == 'white'){
    document.getElementById('navbar').style.backgroundColor = 'transparent'
  }else{
    document.getElementById('navbar').style.backgroundColor = 'white'
  }
})

