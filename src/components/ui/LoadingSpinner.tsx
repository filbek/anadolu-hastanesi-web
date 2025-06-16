import { motion } from 'framer-motion'

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex flex-col items-center">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full"
        />
        <p className="mt-4 text-primary font-medium">Yükleniyor...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
