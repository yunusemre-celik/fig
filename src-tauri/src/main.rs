// Prevents console window on Windows
#![windows_subsystem = "windows"]

#[cfg(target_os = "windows")]
fn is_webview2_installed() -> bool {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use windows_sys::Win32::System::Registry::{
        RegCloseKey, RegOpenKeyExW, RegQueryValueExW, HKEY, HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE,
        KEY_READ, KEY_WOW64_32KEY, REG_SZ,
    };

    fn to_wide(s: &str) -> Vec<u16> {
        OsStr::new(s).encode_wide().chain(std::iter::once(0)).collect()
    }

    let subkeys = [
        (HKEY_LOCAL_MACHINE, r"SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"),
        (HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"),
        (HKEY_CURRENT_USER, r"Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"),
    ];

    let pv_wide = to_wide("pv");

    for (root, subkey) in subkeys {
        let wide_key = to_wide(subkey);
        let mut hkey: HKEY = std::ptr::null_mut();
        let status = unsafe {
            RegOpenKeyExW(
                root,
                wide_key.as_ptr(),
                0,
                KEY_READ | KEY_WOW64_32KEY,
                &mut hkey,
            )
        };
        if status == 0 && !hkey.is_null() {
            let mut buf = [0u16; 128];
            let mut buf_size = (buf.len() * 2) as u32;
            let mut val_type = 0u32;
            let q_status = unsafe {
                RegQueryValueExW(
                    hkey,
                    pv_wide.as_ptr(),
                    std::ptr::null_mut(),
                    &mut val_type,
                    buf.as_mut_ptr() as *mut u8,
                    &mut buf_size,
                )
            };
            unsafe {
                RegCloseKey(hkey);
            }
            if q_status == 0 && val_type == REG_SZ {
                let s = String::from_utf16_lossy(&buf[..(buf_size as usize / 2).saturating_sub(1)]);
                let s = s.trim_matches('\0').trim();
                if !s.is_empty() && s != "0.0.0.0" {
                    return true;
                }
            }
        }
    }
    false
}

#[cfg(target_os = "windows")]
fn prompt_webview2_installation() {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use windows_sys::Win32::UI::Shell::ShellExecuteW;
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        MessageBoxW, IDYES, MB_ICONWARNING, MB_YESNO,
    };

    fn to_wide(s: &str) -> Vec<u16> {
        OsStr::new(s).encode_wide().chain(std::iter::once(0)).collect()
    }

    let title = to_wide("Fig - Microsoft Edge WebView2 Gerekli");
    let message = to_wide(
        "Fig uygulamasının çalışabilmesi için sisteminizde 'Microsoft Edge WebView2 Runtime' bileşeni kurulu olmalıdır.\n\n\
        Windows 10 sistemlerde bu bileşen varsayılan olarak kurulu gelmeyebilir.\n\n\
        Resmi Microsoft indirme sayfasını açıp WebView2'yi şimdi yüklemek ister misiniz?",
    );

    let res = unsafe {
        MessageBoxW(
            std::ptr::null_mut(),
            message.as_ptr(),
            title.as_ptr(),
            MB_YESNO | MB_ICONWARNING,
        )
    };

    if res == IDYES {
        let op = to_wide("open");
        let url = to_wide("https://go.microsoft.com/fwlink/p/?LinkId=2124703");
        unsafe {
            ShellExecuteW(
                std::ptr::null_mut(),
                op.as_ptr(),
                url.as_ptr(),
                std::ptr::null(),
                std::ptr::null(),
                1, // SW_SHOWNORMAL
            );
        }
    }
}

fn main() {
    #[cfg(target_os = "windows")]
    {
        if !is_webview2_installed() {
            prompt_webview2_installation();
            return;
        }
    }

    fig_lib::run()
}

