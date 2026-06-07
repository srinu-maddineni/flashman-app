import React from 'react'
import { image } from '../assets/image'
import { useNavigate } from 'react-router-dom'
const Nav = () => {
  const navigate = useNavigate()
  const handleClick =()=> {
    navigate("/login");
  }
  return (
    <div className='flex h-16 w-full items-center justify-between  px-6 shadow-md bg-white'>
        <div className='flex items-center gap-2'>
            <img src={image.flash} className='h-16 w-auto object-contain'/>
            <span className="text-xl font-bold text-gray-800">Flashman</span>
        </div>
        <div>
<button onClick={handleClick} className='rounded-full bg-black px-5 py-2 font-medium text-white border-3 border-transparent transition hover:bg-transparent hover:text-black hover:border-black'>Login</button>        </div>
    </div>
  )
}

export default Nav