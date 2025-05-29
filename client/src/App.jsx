import { Route, Routes} from "react-router-dom" ;
import './App.css'
import HomePage from './components/HomePage.jsx';
import LoginScreen from './components/Login.jsx';


export default function App () {
  return (
    <div className="app">
    <LoginScreen />
    </div>
  )
}
