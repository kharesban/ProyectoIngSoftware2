import { useContext } from "react"
import { AuthContext } from "../Context/MyContext"
import { Link } from "react-router-dom"; 


function Menu(){
   const {user} = useContext(AuthContext)


    return (
        <>
        <h1>Bienvenido {user?.user}</h1>
        
        <Link to="/">
            <button>Cerrar Sesion</button>
        </Link>
        

        </>
    )
}

export default Menu