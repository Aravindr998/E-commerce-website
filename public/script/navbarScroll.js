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