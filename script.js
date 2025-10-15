        const STATIC_QRIS = "00020101021126570011ID.DANA.WWW011893600915358582377302095858237730303UMI51440014ID.CO.QRIS.WWW0215ID10243110412390303UMI5204561153033605802ID5912HSTOREREALL 6011Kab. Blitar6105661616304BD39";
        let selectedPayment = 'QRIS';

        function formatRupiah(amount) {
            return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }

        function updateAmounts() {
            const input = document.getElementById('nominalInput').value.trim();
            const amount = parseInt(input) || 0;
            
            if (amount > 0) {
                document.getElementById('totalAmount').textContent = formatRupiah(amount);
            } else {
                document.getElementById('totalAmount').textContent = 'Rp 0';
            }
        }

        function charCodeAt(str, index) {
            return str.charCodeAt(index);
        }

        function ConvertCRC16(str) {
            let crc = 0xFFFF;
            const strlen = str.length;
            
            for (let c = 0; c < strlen; c++) {
                crc ^= charCodeAt(str, c) << 8;
                for (let i = 0; i < 8; i++) {
                    if (crc & 0x8000) {
                        crc = (crc << 1) ^ 0x1021;
                    } else {
                        crc = crc << 1;
                    }
                }
            }
            
            let hex = (crc & 0xFFFF).toString(16).toUpperCase();
            return hex.length === 3 ? '0' + hex : hex.padStart(4, '0');
        }

        function generateQRCode(text, amount) {
            const qr = qrcode(0, 'M');
            qr.addData(text);
            qr.make();
            
            Swal.fire({
                title: 'Scan Untuk Pembayaran',
                html: `
                    <p class="text-gray-600 mb-2">Terimakasih atas pembayaran Anda!</p>
                    <div class="bg-gray-100 rounded-lg p-3 mb-3 text-left">
                        <div class="flex justify-between font-bold text-green-600"><span>Total:</span> <span class="font-bold">${formatRupiah(amount)}</span></div>
                    </div>
                    <div class="mt-2">
                        <img src="${qr.createDataURL(10)}" alt="Kode Pembayaran" class="mx-auto" style="max-width: 250px;">
                    </div>
                `,
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#3B82F6',
                background: '#f0f9ff',
            });
        }

        function selectPayment(method) {
            selectedPayment = method;
            
            // Hapus kelas selected dari semua opsi
            document.querySelectorAll('.payment-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Tambahkan kelas selected ke opsi yang dipilih
            event.currentTarget.classList.add('selected');
            
            Swal.fire({
                icon: 'info',
                title: `Metode ${method} Dipilih`,
                text: `Anda memilih pembayaran melalui ${method}. Silakan masukkan nominal.`,
                confirmButtonColor: '#3B82F6'
            });
        }

        function convertQRIS() {
            const input = document.getElementById('nominalInput').value.trim();
            
            if (!input || isNaN(input) || parseInt(input) < 1) {
                Swal.fire({
                    icon: 'error',
                    title: 'Nominal Tidak Valid',
                    text: 'Masukkan nominal berupa angka terlebih dahulu',
                    confirmButtonColor: '#3B82F6'
                });
                return;
            }

            const amount = parseInt(input);

            if (selectedPayment === 'QRIS') {
                let qris = STATIC_QRIS.slice(0, -4);
                let step1 = qris.replace("010211", "010212");
                let step2 = step1.split("5802ID");
                let uang = "54" + amount.toString().length.toString().padStart(2, '0') + amount.toString();
                uang += "5802ID";
                const fix = step2[0].trim() + uang + step2[1].trim();
                const finalQR = fix + ConvertCRC16(fix);
                generateQRCode(finalQR, amount);
            } else if (selectedPayment === 'DANA' || selectedPayment === 'GoPay') {
                const accountName = selectedPayment === 'DANA' ? 'Ilham Adam Shodiqin' : 'Adamm';

                Swal.fire({
                    icon: 'info',
                    title: `Pembayaran via ${selectedPayment}`,
                    html: `
                        <p class="text-gray-600 mb-2">Kirim pembayaran ke nomor berikut:</p>
                        <p class="font-bold text-lg">${selectedPayment}: 085850961679</p>
                        <p class="font-bold text-lg">A/N: <span class="font-bold text-lg">${accountName}</span></p>
                        <div class="bg-gray-100 rounded-lg p-3 mt-3 text-left">
                            <div class="flex justify-between font-bold text-green-600">
                                <span>Total:</span> 
                                <span class="font-bold">${formatRupiah(amount)}</span>
                        </div>
                        </div>
                    `,
                    confirmButtonText: 'Tutup',
                    confirmButtonColor: '#3B82F6',
                    background: '#f0f9ff',
                });
            }
        }

        // Event listeners
        document.getElementById('convertBtn').addEventListener('click', convertQRIS);
        document.getElementById('nominalInput').addEventListener('input', updateAmounts);
        document.getElementById('nominalInput').value = '';
        
        // Pilih QRIS secara default saat halaman dimuat
        window.onload = function() {
            document.querySelector('.payment-option').classList.add('selected');
        };