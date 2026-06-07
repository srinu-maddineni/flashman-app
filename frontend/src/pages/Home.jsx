import React from 'react'
import Nav from '../components/Nav'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();
  const handleClick = ()=>{
    navigate("/login");
  }
  return (
    <>
        <Nav/>
        <div className='flex-1  text-center mt-50 w-full '>
          <div className='mb-10'><h1 className='text-4xl'>Welcome <span className='text-red-600 pl-4'>Flash</span><span className='text-yellow-500'>Man</span></h1></div>
          
          <div className='flex text-center w-full'><p className='text-xl w-200 ml-100'>Blink and you’ll miss it. We bring superhero speed and precision to your everyday workflow, helping you achieve more in less time.</p></div>
          <button className='rounded-full p-3 mt-5 font-medium  border-2 bg-black text-white hover:bg-transparent hover:text-black ' onClick={handleClick}>Signup</button>
        </div>
    </>
  )
}

export default Home