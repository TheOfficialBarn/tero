/*
Significance of this file:
	Contains info about the name, icons, and how it should be displayed
	as an icon on the user's device
	
	PWA needs to know the name shown on the homescreen, icon, etc.

*/

export default function manifest() {
	return {
	  name: 'PWA Test', // App switcher / instalation
	  short_name: 'PWA', // homescreen
	  description: 'A Progressive Web App Test',
	  start_url: '/',
	  display: 'standalone', // Telling you don't load it in safari, load it as a standalone app!!!!!!!
	  background_color: '#ffffff',
	  theme_color: '#000000',
	  icons: [ // App icons
		{
		  src: '/icon-192x192.png',
		  sizes: '192x192',
		  type: 'image/png',
		},
		{
		  src: '/icon-512x512.png',
		  sizes: '512x512',
		  type: 'image/png',
		},
	  ],
	}
  }