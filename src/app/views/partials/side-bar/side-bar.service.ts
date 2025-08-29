import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  constructor(private router: Router) {}
  ngOnInit(): void {}

  list: any[] = [
    {
      moduleName: 'Startup Weaver',
      menus: [
        {
          title: 'Dashboard',
          link: 'dashboard',
          icon: 'home',
        },
        {
          title: 'Registeration',
          link: 'registerComponent',
          icon: 'user-plus',
        },
        {
          title: 'All Members',
          link: 'users',
          icon: 'users',
        },
        // {
        //   title: 'Import Users',
        //   link: 'importUsers',
        //   icon: 'file-import',
        // },
        // Master Component Section with Submenu
        {
          title: 'Master Section',
          icon: 'settings',
          hasSubmenu: true,
          menu: [
            {
              title: 'Countries',
              link: 'country',
              icon: 'globe',
            },
            {
              title: 'States',
              link: 'states',
              icon: 'map',
            },
            {
              title: 'Cities',
              link: 'city',
              icon: 'map-pin',
            },
            {
              title: 'Castes',
              link: 'caste',
              icon: 'cast',
            },
            {
              title: 'SubCastes',
              link: 'subcaste',
              icon: 'user-minus',
            },
            {
              title: 'Industries',
              link: 'category',
              icon: 'tag',
            },
            {
              title: 'Categories',
              link: 'subcategory',
              icon: 'list',
            },
            
          ],
        },
        {
          title: 'Business Form',
          icon: 'settings',
          hasSubmenu: true,
          menu: [
            {
              title: 'Chapter',
              link: 'chapter',
              icon: 'layers',
            },
            {
              title: 'Attendence',
              link: 'attendence',
              icon: 'check-square',
            },
            {
              title: 'Circular',
              link: 'circular',
              icon: 'file-text',
            },
            {
              title: 'Document',
              link: 'document',
              icon: 'file',
            },       
            {
              title: 'Badge Management',
              link: 'badgeManagement',
              icon: 'layers',
            },
            {
              title:'Analytics',
              link:'analytics',
              icon:'award'
            },
          ],
        },
        // Reports Section with Submenu (with proper icon and hasSubmenu flag)
        {
          title: 'Business Reports',
          icon: 'file-text',
          hasSubmenu: true,
          menu: [
            
            {
              title: 'Referral Given Report',
              link: 'referralReport',
              icon: 'corner-up-right',
            },
            {
              title: 'Testimonial Report',
              link: 'testimonialReport',
              icon: 'message-square',
            },
            {
              title: 'One To One Report',
              link: 'oneTooneReport',
              icon: 'user-check',
            },
            {
              title: 'Tyfcb Report',
              link: 'tyfcb',
              icon: 'trending-up',
            },
            {
              title: 'Visitors Report',
              link: 'VisitorsReport',
              icon: 'user',
            },
            {
              title: 'Ask Management',
              link: 'askManagement',
              icon: 'help-circle',
            },
            {
              title: 'Points History',
              link: 'pointHistory',
              icon: 'list',
            },
            {
              title: 'Attendance Record',
              link: 'attendanceRecord',
              icon: 'clipboard',
            },
            {
              title: 'Fees Record',
              link: 'fees',
              icon: 'credit-card',
            },
          ],
        },
        {
          title: 'Community & Social',
          icon: 'settings',
          hasSubmenu: true,
          menu: [
            {
              title: 'Events',
              link: 'events',
              icon: 'calendar',
            },
            {
              title: 'Matrimony',
              link: 'matrimony',
              icon: 'heart',
            },
            {
              title:'Buy & Sell Product',
              link:'secondHand',
              icon:'shopping-cart'
            },
            {
              title:'Family History',
              link:'family',
              icon:'users'
            },
          ],
        },
        {
          title: 'Services & Marketplace',
          icon: 'settings',
          hasSubmenu: true,
          menu: [
            {
              title: 'Jobs',
              link: 'jobs',
              icon: 'briefcase',
            },
            {
              title: 'Blood Group',
              link: 'blood-group',
              icon: 'droplet',
            },
          ],
        },
        {
          title: 'Feedback & Management',
          icon: 'settings',
          hasSubmenu: true,
          menu: [
            {
              title: 'Survey',
              link: 'survey',
              icon: 'check-circle',
            },
            {
              title: 'Polls',
              link: 'poll',
              icon: 'check-circle',
            },
            {
              title: 'Transactions',
              link: 'transaction',
              icon: 'check-circle',
            },
            {
              title: 'Complaints',
              link: 'complaints',
              icon: 'alert-triangle',
            },
          ],
        },
        {
          title: 'Support & Settings',
          icon: 'settings',
          hasSubmenu: true,
          menu: [
            {
              title: 'Suggestions',
              link: 'suggestions',
              icon: 'edit',
            },
            // {
            //   title: 'Contact Us',
            //   link: 'contactUs',
            //   icon: 'mail',
            // },
          ],
        },
        {
          title: 'Other Options',
          icon: 'settings',
          hasSubmenu: true,
          menu: [
            {
              title: 'Banner',
              link: 'banners',
              icon: 'banner',
            },
            {
              title: 'Badges',
              link: 'badges',
              icon: 'award',
            },
            {
              title: 'LeaderBoard',
              link: 'leaderboard',
              icon: 'award',
            },
            {
              title: 'Pre Participation',
              link: 'participation',
              icon: 'check-circle',
            },
            {
              title: 'Discussion',
              link: 'discussion',
              icon: '',
            },
            {
              title: 'Leads',
              link: 'leads',
              icon: '',
            },

          ],
        },
      ],
    },
  ];

  isMobile: boolean = false;
  activeSubMenuIndex: number | null = null;

  toggleSubMenu(index: number) {
    if (this.activeSubMenuIndex === index) {
      this.activeSubMenuIndex = null;
    } else {
      this.activeSubMenuIndex = index;
    }
  }

  navigateWithQueryParams(submenu: any) {
    this.router.navigate([submenu.link], { queryParams: submenu.queryParams });
  }

  onNavSwitch(item: string) {
    this.router.navigateByUrl(`/${item}`);
  }
}
