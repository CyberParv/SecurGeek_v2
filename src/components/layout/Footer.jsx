import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Mail, Phone, MapPin, ArrowRight, Heart } from 'lucide-react'

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-secondary-500/10 to-cyber-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* About Section */}
          <motion.div className="col-span-1 md:col-span-1" variants={itemVariants}>
            <motion.div 
              className="flex items-center space-x-3 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <div className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl blur opacity-30"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                SecurGeek
              </span>
            </motion.div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your trusted partner in cybersecurity training and awareness for SMEs. Building the next generation of security professionals.
            </p>
            <div className="flex space-x-4">
              {['twitter', 'linkedin', 'github'].map((social) => (
                <motion.a
                  key={social}
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-primary-500 hover:to-secondary-500 rounded-xl flex items-center justify-center transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-5 h-5 bg-gray-400 rounded"></div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Company */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-secondary-400 to-cyber-400 bg-clip-text text-transparent">
              Company
            </h3>
            <ul className="space-y-4">
              {[
                { label: 'About Us', to: '/about' },
                { label: 'Contact', to: '/contact' },
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms of Service', to: '/terms' }
              ].map((item, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <Link 
                    to={item.to}
                    className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group"
                  >
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{item.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-cyber-400 to-primary-400 bg-clip-text text-transparent">
              Contact
            </h3>
            <ul className="space-y-4">
              {[
                { icon: Mail, text: 'securgeek@gmail.com', color: 'from-blue-500 to-blue-600' },
                { icon: Phone, text: '+91 8826038451', color: 'from-green-500 to-green-600' },
                { icon: MapPin, text: 'Manipal University Jaipur, Rajasthan-303007', color: 'from-purple-500 to-purple-600' }
              ].map((contact, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-start space-x-3 group"
                  whileHover={{ x: 5 }}
                >
                  <div className={`w-8 h-8 bg-gradient-to-r ${contact.color} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300`}>
                    <contact.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-400 group-hover:text-white transition-colors">
                    {contact.text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Newsletter Section */}
        <motion.div 
          className="border-t border-gray-800 mt-16 pt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Stay Updated
            </h3>
            <p className="text-gray-400 mb-8">
              Subscribe to stay updated with the latest in cybersecurity training and get exclusive tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-400"
              />
              <motion.button 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          className="border-t border-gray-800 mt-12 pt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 flex items-center justify-center space-x-2">
            <span>© 2024 SecurGeek. Made with</span>
            <span>
              <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                style={{ display: 'inline-block' }}
            >
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              </motion.span>
            </span>
            <span>for cybersecurity professionals.</span>
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer