pub mod commands;

#[cfg(not(test))]
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Emitter, Manager,
};

#[cfg(not(test))]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Build Tray Menu
            let show_item = MenuItem::with_id(app, "show", "Fig'i Göster", true, None::<&str>)?;
            let wheel_item = MenuItem::with_id(app, "wheel", "İşlem Çarkını Aç", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Çıkış", true, None::<&str>)?;
            let tray_menu = Menu::with_items(app, &[&show_item, &wheel_item, &quit_item])?;

            let mut builder = TrayIconBuilder::new()
                .menu(&tray_menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "wheel" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.emit("open-wheel", ());
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Left,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                });

            if let Some(icon) = app.default_window_icon() {
                builder = builder.icon(icon.clone());
            }

            let _tray = builder.build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_file_info,
            commands::convert_image,
            commands::crop_image,
            commands::compress_image,
            commands::read_qr_code,
            commands::generate_qr_code,
            commands::create_pdf_from_images,
            commands::reveal_in_explorer,
            commands::open_in_terminal,
            commands::open_file,
            commands::get_library,
            commands::add_to_library,
            commands::clear_library,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
pub fn run() {}
