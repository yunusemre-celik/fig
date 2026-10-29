pub mod commands;

#[cfg(not(test))]
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};

#[cfg(not(test))]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Check if launched with --minimized
            let is_minimized = std::env::args().any(|arg| arg == "--minimized");
            if is_minimized {
                if let Some(main_win) = app.get_webview_window("main") {
                    let _ = main_win.hide();
                }
            }

            // Build Tray Menu
            let show_item = MenuItem::with_id(app, "show", "Fig'i Göster", true, None::<&str>)?;
            let wheel_item = MenuItem::with_id(app, "wheel", "İşlem Çarkını Aç (Ctrl+Space)", true, None::<&str>)?;
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
                        let _ = commands::show_wheel_at_cursor(app.clone());
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

            // Register global shortcut: Ctrl + Space across entire Windows
            #[cfg(target_os = "windows")]
            {
                let app_handle = app.handle().clone();
                std::thread::spawn(move || {
                    unsafe {
                        const MOD_CONTROL: u32 = 0x0002;
                        const VK_SPACE: u32 = 0x20;
                        const HOTKEY_ID: i32 = 9001;

                        if windows_sys::Win32::UI::Input::KeyboardAndMouse::RegisterHotKey(
                            std::ptr::null_mut(),
                            HOTKEY_ID,
                            MOD_CONTROL,
                            VK_SPACE,
                        ) != 0 {
                            let mut msg = std::mem::zeroed();
                            while windows_sys::Win32::UI::WindowsAndMessaging::GetMessageW(
                                &mut msg,
                                std::ptr::null_mut(),
                                0,
                                0,
                            ) > 0
                            {
                                if msg.message == windows_sys::Win32::UI::WindowsAndMessaging::WM_HOTKEY
                                    && msg.wParam as i32 == HOTKEY_ID
                                {
                                    let fg = windows_sys::Win32::UI::WindowsAndMessaging::GetForegroundWindow();
                                    if !fg.is_null() {
                                        commands::record_foreground_hwnd(fg as isize);
                                    }
                                    let _ = commands::show_wheel_at_cursor(app_handle.clone());
                                }
                            }
                        }
                    }
                });
            }

            // Apply native Windows 11 Mica / Acrylic vibrancy
            #[cfg(target_os = "windows")]
            {
                use window_vibrancy::{apply_acrylic, apply_mica};
                if let Some(main_win) = app.get_webview_window("main") {
                    // Try Mica (Windows 11 22H2+); fall back to Acrylic with low alpha so wallpaper shows through
                    if apply_mica(&main_win, None).is_err() {
                        let _ = apply_acrylic(&main_win, Some((8, 10, 18, 60)));
                    }
                }
            }

            Ok(())
        })
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                if window.label() == "main" {
                    let _ = window.hide();
                    api.prevent_close();
                }
            }
            tauri::WindowEvent::Focused(false) => {
                if window.label() == "wheel" && !commands::is_dialog_active() {
                    let _ = window.hide();
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            commands::show_wheel_window,
            commands::show_wheel_at_cursor,
            commands::hide_wheel,
            commands::expand_wheel_window,
            commands::restore_wheel_window,
            commands::show_main_window,
            commands::set_window_vibrancy,
            commands::pick_file_dialog,
            commands::get_selected_explorer_files,
            commands::get_file_info,
            commands::convert_image,
            commands::read_image_data_url,
            commands::crop_image,
            commands::compress_image,
            commands::censor_image,
            commands::read_qr_code,
            commands::generate_qr_code,
            commands::create_pdf_from_images,
            commands::convert_document,
            commands::convert_media,
            commands::convert_pdf,
            commands::get_app_settings,
            commands::save_app_settings,
            commands::get_autostart,
            commands::set_autostart,
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
