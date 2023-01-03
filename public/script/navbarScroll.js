window.onscroll = () =>{
  scrollFunction()
}

function scrollFunction(){
  if(document.body.scrollTop > 80 || document.documentElement.scrollTop > 80){
    document.getElementById('navbar').style.backgroundColor = 'white'
  }else{
    document.getElementById('navbar').style.backgroundColor = 'transparent'
  }
}