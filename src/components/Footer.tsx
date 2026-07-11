export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full border-t border-black/20 bg-(--header-bg) px-4 py-4 text-center text-sm font-medium text-(--color-background) shadow-md">
      <span>&copy; {year} Created by USSTM. All rights reserved.</span>
    </footer>
  )
}
