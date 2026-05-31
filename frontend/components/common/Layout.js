import Navbar from './Navbar'
import Footer from './Footer'

const Layout = ({ children, fullWidth = false }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-grow ${fullWidth ? '' : 'bg-let-white'}`}>
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout



