from myojana.utils.after_install import AfterInstall

def update_myojana_settings():
    AfterInstall.set_app_name()
    AfterInstall.set_brand_logo()
    AfterInstall.set_favicons()
    AfterInstall.set_navbar_logo()
    AfterInstall.set_navbar_setting()
    AfterInstall.set_splash_image()
    AfterInstall.set_website_logo()