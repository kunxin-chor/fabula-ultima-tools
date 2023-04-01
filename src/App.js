import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import RareAccessory from './RareAccessory';
import RareDefensiveGear from './RareDefensiveGear';
import RareItem from './RareItem';

function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <Link className="navbar-brand" to="/">Rare Items</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/">Items</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/defensive-gear">Defensive Gear</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/accessories">Accessories</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<RareItem />} />
          <Route path="/defensive-gear" element={<RareDefensiveGear />} />
          <Route path="/accessories" element={<RareAccessory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
