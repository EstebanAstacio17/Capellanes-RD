/**
 * ==========================================================================
 * MINISTERIO DE CAPELLANES DE LA REPÚBLICA DOMINICANA (M.CA.RD.O. / MICARD)
 * MOTOR PRINCIPAL: VERIFICACIÓN, SOLICITUDES, RASTREO Y GALERÍA
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initVerifier();
    initWizard();
    initTracker();
    initGallery();
    initAnalytics();
});

/* ==========================================================================
   1. BASE DE DATOS DE CAPELLANES ACREDITADOS (DEMOSTRATIVA AUDITABLE)
   ========================================================================== */
const CAPELLANES_REGISTRY = [
    {
        idCarnet: 'DO-2026-OC-0015-9',
        cedula: '001-1849204-3',
        nombre: 'Dawrin Uribe',
        rango: 'Oficial Capellán (OC)',
        especialidad: 'Gestión de Crisis y Capellanía Comunitaria',
        jurisdiccion: 'San Cristóbal / Región Valdesia',
        pais: 'República Dominicana',
        fechaEmision: '15/01/2026',
        fechaVencimiento: '15/01/2028',
        estado: 'Activo',
        foto: 'fotos/actividad-capellanes-4.webp',
        iglesia: 'Concilio Evangélico Internacional',
        rangoCodigo: 'OC'
    },
    {
        idCarnet: 'DO-2026-MC-0042-3',
        cedula: '002-0049281-5',
        nombre: 'Pastor Juan Esteban',
        rango: 'Ministro Capellán (MC)',
        especialidad: 'Capellanía Hospitalaria y Cuidados Paliativos',
        jurisdiccion: 'Santo Domingo / Distrito Nacional',
        pais: 'República Dominicana',
        fechaEmision: '10/02/2026',
        fechaVencimiento: '10/02/2028',
        estado: 'Activo',
        foto: 'fotos/actividad-capellanes-3.webp',
        iglesia: 'Comunidad Cristiana Central',
        rangoCodigo: 'MC'
    },
    {
        idCarnet: 'DO-2026-AC-0089-1',
        cedula: '402-2394851-9',
        nombre: 'Licda. Carmen Altagracia Pérez',
        rango: 'Agente Capellán (AC)',
        especialidad: 'Capellanía Penitenciaria y Readaptación',
        jurisdiccion: 'Santiago de los Caballeros / Región Norte',
        pais: 'República Dominicana',
        fechaEmision: '01/03/2026',
        fechaVencimiento: '01/03/2028',
        estado: 'Activo',
        foto: 'fotos/actividad-capellanes-5.webp',
        iglesia: 'Iglesia de la Gracia y Restauración',
        rangoCodigo: 'AC'
    },
    {
        idCarnet: 'DO-2026-OC-0104-7',
        cedula: '001-0982345-2',
        nombre: 'Dr. Roberto M. Gómez Peña',
        rango: 'Oficial Capellán (OC)',
        especialidad: 'Capellanía de Derechos Humanos y Mediación',
        jurisdiccion: 'Santo Domingo Este / Provincia Santo Domingo',
        pais: 'República Dominicana',
        fechaEmision: '20/02/2026',
        fechaVencimiento: '20/02/2028',
        estado: 'Activo',
        foto: 'fotos/actividad-capellanes-7.webp',
        iglesia: 'Misión Bíblica Apostólica',
        rangoCodigo: 'OC'
    }
];

/* ==========================================================================
   2. NAVBAR & SCROLL EFFECTS
   ========================================================================== */
function initNavbar() {
    const navbar = document.querySelector('.main-navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Auto-close mobile menu on click
    const navLinks = document.querySelectorAll('.nav-link');
    const menuCollapse = document.getElementById('menuPrincipal');
    if (menuCollapse) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992 && menuCollapse.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(menuCollapse);
                    if (bsCollapse) bsCollapse.hide();
                }
            });
        });
    }
}

/* ==========================================================================
   3. MÓDULO DE VERIFICACIÓN DE CREDENCIALES (SEARCH & VERIFY ID)
   ========================================================================== */
function initVerifier() {
    const btnSearch = document.getElementById('btnSearchCarnet');
    const inputSearch = document.getElementById('inputSearchCarnet');
    const resultBox = document.getElementById('verifierResultContainer');

    if (!btnSearch || !inputSearch || !resultBox) return;

    function performSearch() {
        const query = inputSearch.value.trim().toUpperCase().replace(/\s+/g, '');
        if (!query) {
            alert('Por favor ingrese el Código de Carnet (Ej: DO-2026-OC-0015-9) o Número de Cédula.');
            inputSearch.focus();
            return;
        }

        // Search in registry + local storage registered capellanes
        let found = CAPELLANES_REGISTRY.find(c => 
            c.idCarnet.toUpperCase().replace(/[^A-Z0-9]/g, '') === query.replace(/[^A-Z0-9]/g, '') ||
            c.cedula.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, '')
        );

        if (!found) {
            // Check local submitted applications that might have been approved
            const stored = JSON.parse(localStorage.getItem('micardo_applications') || '[]');
            const fromStorage = stored.find(s => 
                (s.trackingCode && s.trackingCode.toUpperCase() === query) ||
                (s.cedula && s.cedula.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, ''))
            );
            if (fromStorage && fromStorage.status === 'Aprobado') {
                found = {
                    idCarnet: fromStorage.idCarnet || `DO-2026-${fromStorage.rangoCode || 'OC'}-9901-5`,
                    cedula: fromStorage.cedula,
                    nombre: `${fromStorage.nombres} ${fromStorage.apellidos}`,
                    rango: fromStorage.rango,
                    especialidad: fromStorage.especialidad || 'Capellanía Comunitaria',
                    jurisdiccion: `${fromStorage.provincia} / Cobertura Oficial`,
                    pais: 'República Dominicana',
                    fechaEmision: fromStorage.dateSubmitted || '01/03/2026',
                    fechaVencimiento: '01/03/2028',
                    estado: 'Activo',
                    foto: 'img/logo-institucional.webp',
                    iglesia: fromStorage.iglesia || 'Ministerio Acreditado'
                };
            }
        }

        if (found) {
            trackGA4Event('verificacion_exitosa', { id_carnet: found.idCarnet, rango: found.rango });
            renderVerificationSuccess(found, resultBox);
        } else {
            trackGA4Event('verificacion_fallida', { query_buscada: query });
            renderVerificationNotFound(query, resultBox);
        }

        resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    btnSearch.addEventListener('click', performSearch);
    inputSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

function renderVerificationSuccess(c, container) {
    const qrData = encodeURIComponent(`https://capellanesrd-764f8.web.app/?verify=${c.idCarnet}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

    container.innerHTML = `
        <div class="result-card-official">
            <div class="result-card-header">
                <div class="d-flex align-items-center gap-3">
                    <i class="fa-solid fa-shield-halved text-gold fs-3"></i>
                    <div>
                        <h4 class="m-0 text-white font-heading">Credencial Oficial Verificada</h4>
                        <small class="text-light">Registro Nacional de Capellanes M.CA.RD.O. / MICARD</small>
                    </div>
                </div>
                <span class="status-chip status-chip-active">
                    <i class="fa-solid fa-circle-check"></i> ${c.estado}
                </span>
            </div>

            <div class="p-4 bg-white">
                <div class="row align-items-center g-4">
                    <!-- Carnet Digital 3D Preview -->
                    <div class="col-lg-5">
                        <div class="carnet-preview-container">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <div class="carnet-header-badge">REPÚBLICA DOMINICANA</div>
                                    <strong style="color: #DFB742; font-size: 0.95rem;">MINISTERIO DE CAPELLANES</strong>
                                </div>
                                <img src="img/logo-institucional.webp" alt="Escudo Oficial" style="height: 38px;">
                            </div>

                            <div class="d-flex gap-3 align-items-center mb-3">
                                <img src="${c.foto}" alt="${c.nombre}" class="carnet-photo">
                                <div>
                                    <div class="text-light" style="font-size: 0.75rem;">CAPELLÁN ACREDITADO:</div>
                                    <h6 class="text-white fw-bold mb-1" style="font-size: 1.05rem;">${c.nombre}</h6>
                                    <div class="badge bg-gold text-dark fw-bold mb-1" style="font-size: 0.75rem;">${c.rango}</div>
                                    <div class="text-light" style="font-size: 0.75rem;">Cédula: <strong>${c.cedula}</strong></div>
                                </div>
                            </div>

                            <div class="d-flex justify-content-between align-items-end pt-2 border-top border-secondary">
                                <div>
                                    <small class="text-muted d-block" style="font-size: 0.7rem;">ID CARNET OFICIAL:</small>
                                    <span class="fw-bold font-monospace text-gold">${c.idCarnet}</span>
                                    <small class="text-muted d-block mt-1" style="font-size: 0.68rem;">VENCE: ${c.fechaVencimiento}</small>
                                </div>
                                <div class="carnet-qr-box">
                                    <img src="${qrUrl}" alt="QR Verificación" style="width: 55px; height: 55px;">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Ficha de Datos Institucionales -->
                    <div class="col-lg-7">
                        <div class="table-responsive">
                            <table class="table table-borderless align-middle mb-0">
                                <tbody>
                                    <tr>
                                        <th class="text-muted ps-0" style="width: 38%;">Nombre Completo:</th>
                                        <td class="fw-bold text-navy">${c.nombre}</td>
                                    </tr>
                                    <tr>
                                        <th class="text-muted ps-0">Identificación Oficial:</th>
                                        <td class="fw-bold text-navy">${c.cedula}</td>
                                    </tr>
                                    <tr>
                                        <th class="text-muted ps-0">Código ID Carnet:</th>
                                        <td><span class="badge bg-navy text-gold font-monospace px-3 py-2 fs-6">${c.idCarnet}</span></td>
                                    </tr>
                                    <tr>
                                        <th class="text-muted ps-0">Rango Institucional:</th>
                                        <td class="fw-bold text-primary">${c.rango}</td>
                                    </tr>
                                    <tr>
                                        <th class="text-muted ps-0">Especialidad Operativa:</th>
                                        <td>${c.especialidad}</td>
                                    </tr>
                                    <tr>
                                        <th class="text-muted ps-0">Jurisdicción / Provincia:</th>
                                        <td><i class="fa-solid fa-location-dot text-danger me-1"></i> ${c.jurisdiccion}</td>
                                    </tr>
                                    <tr>
                                        <th class="text-muted ps-0">Respaldo Eclesiástico:</th>
                                        <td>${c.iglesia}</td>
                                    </tr>
                                    <tr>
                                        <th class="text-muted ps-0">Periodo de Vigencia:</th>
                                        <td><span class="text-success fw-bold">${c.fechaEmision}</span> hasta <span class="text-danger fw-bold">${c.fechaVencimiento}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="mt-4 pt-3 border-top d-flex gap-2 flex-wrap">
                            <button class="btn btn-sm btn-outline-secondary" onclick="window.print()">
                                <i class="fa-solid fa-print me-1"></i> Imprimir Certificado de Validación
                            </button>
                            <a href="#solicitud" class="btn btn-sm btn-navy-custom">
                                <i class="fa-solid fa-rotate me-1"></i> Renovar / Gestionar Acreditación
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.style.display = 'block';
}

function renderVerificationNotFound(query, container) {
    container.innerHTML = `
        <div class="alert alert-warning border-warning p-4 rounded-4 shadow-sm">
            <div class="d-flex align-items-start gap-3">
                <i class="fa-solid fa-triangle-exclamation text-warning fs-1"></i>
                <div>
                    <h5 class="fw-bold text-dark mb-1">No se encontró registro con el parámetro: "${query}"</h5>
                    <p class="text-muted mb-3">
                        El número ingresado no coincide con una credencial activa en la base de datos nacional o su trámite se encuentra en proceso de validación por el Consejo de Acreditación.
                    </p>
                    <div class="d-flex gap-2 flex-wrap">
                        <a href="#solicitud" class="btn btn-sm btn-gold-custom">
                            <i class="fa-solid fa-file-pen me-1"></i> Iniciar Solicitud de Acreditación
                        </a>
                        <a href="#rastreo" class="btn btn-sm btn-outline-secondary">
                            <i class="fa-solid fa-magnifying-glass-location me-1"></i> Consultar Trámite en Proceso
                        </a>
                        <a href="#contacto" class="btn btn-sm btn-link text-decoration-none">
                            Contactar Secretaría General <i class="fa-solid fa-arrow-right ms-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.style.display = 'block';
}

/* ==========================================================================
   4. PORTAL DE SOLICITUDES Y REGISTRO (WIZARD MULTI-STEP)
   ========================================================================== */
function initWizard() {
    let currentStep = 1;
    const totalSteps = 4;

    const stepIndicators = document.querySelectorAll('.step-indicator');
    const stepContents = document.querySelectorAll('.wizard-step-content');
    const btnNext = document.getElementById('btnWizardNext');
    const btnPrev = document.getElementById('btnWizardPrev');
    const btnSubmit = document.getElementById('btnWizardSubmit');
    const form = document.getElementById('formSolicitudCapellan');

    if (!form || !btnNext || !btnPrev || !btnSubmit) return;

    function updateWizardUI() {
        stepContents.forEach(content => {
            const stepNum = parseInt(content.getAttribute('data-step'));
            content.style.display = stepNum === currentStep ? 'block' : 'none';
        });

        stepIndicators.forEach(indicator => {
            const stepNum = parseInt(indicator.getAttribute('data-step'));
            indicator.classList.remove('active', 'completed');
            if (stepNum === currentStep) {
                indicator.classList.add('active');
            } else if (stepNum < currentStep) {
                indicator.classList.add('completed');
            }
        });

        btnPrev.style.display = currentStep > 1 ? 'inline-flex' : 'none';
        btnNext.style.display = currentStep < totalSteps ? 'inline-flex' : 'none';
        btnSubmit.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
    }

    function validateCurrentStep() {
        const activeContainer = document.querySelector(`.wizard-step-content[data-step="${currentStep}"]`);
        if (!activeContainer) return true;

        const inputs = activeContainer.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });

        if (!isValid) {
            alert('Por favor complete todos los campos requeridos marcados con asterisco (*).');
        }
        return isValid;
    }

    btnNext.addEventListener('click', () => {
        if (validateCurrentStep()) {
            currentStep++;
            updateWizardUI();
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateWizardUI();
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    stepIndicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            const targetStep = parseInt(indicator.getAttribute('data-step'));
            if (targetStep < currentStep || validateCurrentStep()) {
                currentStep = targetStep;
                updateWizardUI();
            }
        });
    });

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateCurrentStep()) return;

        // Collect Form Data
        const formData = {
            nombres: document.getElementById('sol_nombres').value.trim(),
            apellidos: document.getElementById('sol_apellidos').value.trim(),
            cedula: document.getElementById('sol_cedula').value.trim(),
            email: document.getElementById('sol_email').value.trim(),
            telefono: document.getElementById('sol_telefono').value.trim(),
            pais: document.getElementById('sol_pais').value,
            provincia: document.getElementById('sol_provincia').value,
            direccion: document.getElementById('sol_direccion').value.trim(),
            iglesia: document.getElementById('sol_iglesia').value.trim(),
            pastor: document.getElementById('sol_pastor').value.trim(),
            tiempoMinisterio: document.getElementById('sol_tiempo_ministerio').value,
            nivelTeologico: document.getElementById('sol_nivel_teologico').value,
            rango: document.getElementById('sol_rango').options[document.getElementById('sol_rango').selectedIndex].text,
            rangoCode: document.getElementById('sol_rango').value,
            especialidad: document.getElementById('sol_especialidad').value,
            trackingCode: `SOL-2026-${Math.floor(10000 + Math.random() * 90000)}`,
            dateSubmitted: new Date().toLocaleDateString('es-DO'),
            status: 'En Evaluación'
        };

        // Save to LocalStorage
        const existing = JSON.parse(localStorage.getItem('micardo_applications') || '[]');
        existing.push(formData);
        localStorage.setItem('micardo_applications', JSON.stringify(existing));

        // Track GA4 conversion
        trackGA4Event('solicitud_enviada', {
            tracking_code: formData.trackingCode,
            rango_solicitado: formData.rangoCode,
            provincia: formData.provincia
        });

        // Show Confirmation Receipt Modal
        showSuccessModal(formData);
        form.reset();
        currentStep = 1;
        updateWizardUI();
    });

    updateWizardUI();
}

function showSuccessModal(data) {
    const modalEl = document.getElementById('modalComprobanteSolicitud');
    if (!modalEl) return;

    document.getElementById('receiptTrackingCode').textContent = data.trackingCode;
    document.getElementById('receiptNombre').textContent = `${data.nombres} ${data.apellidos}`;
    document.getElementById('receiptCedula').textContent = data.cedula;
    document.getElementById('receiptRango').textContent = data.rango;
    document.getElementById('receiptProvincia').textContent = data.provincia;
    document.getElementById('receiptFecha').textContent = data.dateSubmitted;

    const qrData = encodeURIComponent(`https://capellanesrd-764f8.web.app/?tracking=${data.trackingCode}`);
    document.getElementById('receiptQR').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

/* ==========================================================================
   5. MÓDULO DE RASTREO DE SOLICITUDES (TRACKER)
   ========================================================================== */
function initTracker() {
    const btnTrack = document.getElementById('btnTrackCode');
    const inputTrack = document.getElementById('inputTrackCode');
    const resultBox = document.getElementById('trackerResultContainer');

    if (!btnTrack || !inputTrack || !resultBox) return;

    function performTracking() {
        const code = inputTrack.value.trim().toUpperCase();
        if (!code) {
            alert('Por favor ingrese su Código de Solicitud (Ej: SOL-2026-84920) o Cédula.');
            return;
        }

        const stored = JSON.parse(localStorage.getItem('micardo_applications') || '[]');
        let item = stored.find(s => 
            s.trackingCode.toUpperCase() === code || 
            s.cedula.replace(/[^0-9]/g, '') === code.replace(/[^0-9]/g, '')
        );

        if (!item) {
            // Demo default entry if searching sample
            if (code.startsWith('SOL-') || code.length >= 8) {
                item = {
                    trackingCode: code,
                    nombres: 'Solicitante Acreditación',
                    apellidos: 'Ministerial',
                    cedula: '001-XXXXXXX-X',
                    rango: 'Oficial Capellán (OC)',
                    provincia: 'Santo Domingo',
                    dateSubmitted: '02/09/2026',
                    status: 'En Evaluación'
                };
            }
        }

        if (item) {
            trackGA4Event('rastreo_solicitud_consultada', { codigo: item.trackingCode });
            resultBox.innerHTML = `
                <div class="card border-primary p-4 rounded-4 shadow-sm bg-white">
                    <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom flex-wrap gap-2">
                        <div>
                            <span class="badge bg-navy text-gold px-3 py-2 fs-6 font-monospace">${item.trackingCode}</span>
                            <h5 class="fw-bold mt-2 mb-0">${item.nombres} ${item.apellidos}</h5>
                            <small class="text-muted">Cédula: ${item.cedula} | ${item.rango}</small>
                        </div>
                        <span class="status-chip status-chip-pending">
                            <i class="fa-solid fa-clock-rotate-left"></i> ${item.status || 'En Proceso'}
                        </span>
                    </div>

                    <div class="timeline-tracker">
                        <div class="timeline-item done">
                            <div class="timeline-dot"></div>
                            <h6 class="fw-bold mb-1 text-success"><i class="fa-solid fa-check me-1"></i> 1. Solicitud y Expediente Recibido</h6>
                            <p class="text-muted small m-0">Radicado el ${item.dateSubmitted}. Documentos preliminares registrados en el sistema central.</p>
                        </div>
                        <div class="timeline-item done">
                            <div class="timeline-dot"></div>
                            <h6 class="fw-bold mb-1 text-success"><i class="fa-solid fa-check me-1"></i> 2. Evaluación Pastoral y Eclesiástica</h6>
                            <p class="text-muted small m-0">Validación de carta de recomendación pastoral y formación teológica.</p>
                        </div>
                        <div class="timeline-item current">
                            <div class="timeline-dot"></div>
                            <h6 class="fw-bold mb-1 text-primary"><i class="fa-solid fa-spinner fa-spin me-1"></i> 3. Verificación de Antecedentes y Jurídica</h6>
                            <p class="text-muted small m-0">Revisión de no antecedentes penales y cumplimiento con estatutos de MICARD.</p>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <h6 class="fw-bold mb-1 text-muted">4. Aprobación y Asignación de Rango</h6>
                            <p class="text-muted small m-0">Dictamen oficial por la Comisión de Grados y Disciplina.</p>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <h6 class="fw-bold mb-1 text-muted">5. Emisión de Carnet y Juramentación</h6>
                            <p class="text-muted small m-0">Generación de ID único y entrega de credenciales oficiales.</p>
                        </div>
                    </div>
                </div>
            `;
            resultBox.style.display = 'block';
        } else {
            resultBox.innerHTML = `
                <div class="alert alert-danger rounded-4">
                    No se encontró ningún expediente con el código o cédula ingresado. Por favor verifique el número en su comprobante de radicación.
                </div>
            `;
            resultBox.style.display = 'block';
        }
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    btnTrack.addEventListener('click', performTracking);
    inputTrack.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performTracking();
    });
}

/* ==========================================================================
   6. GALERÍA MULTIMEDIA INTERACTIVA Y LIGHTBOX
   ========================================================================== */
function initGallery() {
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-grid-item');
    const modalImg = document.getElementById('lightboxImg');
    const modalCaption = document.getElementById('lightboxCaption');
    const lightboxModalEl = document.getElementById('lightboxModal');

    if (!lightboxModalEl) return;
    const lightboxModal = new bootstrap.Modal(lightboxModalEl);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const title = item.querySelector('.gallery-title')?.textContent || 'Actividad Oficial';
            const desc = item.querySelector('.gallery-desc')?.textContent || '';

            modalImg.src = img.src;
            modalCaption.innerHTML = `<h5 class="fw-bold text-white mb-1">${title}</h5><p class="text-light m-0">${desc}</p>`;
            lightboxModal.show();
        });
    });
}

/* ==========================================================================
   7. GOOGLE ANALYTICS 4 (GA4) EVENT TRACKING DISPATCHER
   ========================================================================== */
function initAnalytics() {
    // Intercept download links
    document.querySelectorAll('.download-card, a[download]').forEach(link => {
        link.addEventListener('click', () => {
            const docName = link.querySelector('h6')?.textContent || link.textContent.trim();
            trackGA4Event('descarga_documento', { documento: docName });
        });
    });
}

function trackGA4Event(eventName, params = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, params);
        console.log(`[GA4 Event] ${eventName}:`, params);
    } else {
        console.log(`[GA4 Event Mock] ${eventName}:`, params);
    }
}
