window.onscroll = () =>{
  scrollFunction()
}

let scrolled = true
function scrollFunction(){
  if(document.body.scrollTop > 30 || document.documentElement.scrollTop > 30){
    document.getElementById('navbar').style.backgroundColor = 'white'
    scrolled = false
  }else{
    document.getElementById('navbar').style.backgroundColor = 'transparent'
    scrolled = true
  }
}

document.querySelector('button.navbar-toggler').addEventListener('click', (e) => {
  if( document.getElementById('navbar').style.backgroundColor == 'white' && scrolled){
    document.getElementById('navbar').style.backgroundColor = 'transparent'
  }else{
    document.getElementById('navbar').style.backgroundColor = 'white'
  }
})
