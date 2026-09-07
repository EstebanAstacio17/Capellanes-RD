/**
 * ==========================================================================
 * MINISTERIO DE CAPELLANES DE LA REPÚBLICA DOMINICANA (M.CA.RD.O. / MICARD)
 * MOTOR PRINCIPAL: VERIFICACIÓN, CERTIFICACIONES, SOLICITUDES, RASTREO Y GALERÍA
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initVerifier();
    initWizard();
    initTracker();
    initGallery();
    initAnalytics();
    checkUrlQueryParams();
});

/* ==========================================================================
   1. BASE DE DATOS DE CAPELLANES ACREDITADOS Y CERTIFICACIONES OFICIALES
   ========================================================================== */
const CAPELLANES_REGISTRY = [
    {
        idCarnet: 'DO-2026-OC-0015-9',
        certCode: 'CERT-MDO-2026-00489',
        cedula: '001-1849204-3',
        nombre: 'Dawrin Uribe Peña',
        rango: 'Oficial Capellán (OC)',
        especialidad: 'Gestión de Crisis, Capellanía Hospitalaria y Comunitaria',
        jurisdiccion: 'San Cristóbal / Región Valdesia / Cobertura Nacional',
        pais: 'República Dominicana',
        fechaEmision: '07/09/2026',
        fechaVencimientoCarnet: '07/09/2028',
        fechaVencimientoCert: '07/09/2027', // 1 año estricto
        estado: 'Activo',
        foto: 'fotos/actividad-capellanes-4.webp',
        iglesia: 'Concilio Evangélico Internacional',
        rangoCodigo: 'OC'
    },
    {
        idCarnet: 'DO-2026-MC-0042-3',
        certCode: 'CERT-MDO-2026-00102',
        cedula: '002-0049281-5',
        nombre: 'Pastor Juan Esteban',
        rango: 'Ministro Capellán (MC)',
        especialidad: 'Capellanía Hospitalaria y Cuidados Paliativos',
        jurisdiccion: 'Santo Domingo / Distrito Nacional',
        pais: 'República Dominicana',
        fechaEmision: '10/02/2026',
        fechaVencimientoCarnet: '10/02/2028',
        fechaVencimientoCert: '10/02/2027',
        estado: 'Activo',
        foto: 'fotos/actividad-capellanes-3.webp',
        iglesia: 'Comunidad Cristiana Central',
        rangoCodigo: 'MC'
    },
    {
        idCarnet: 'DO-2026-AC-0089-1',
        certCode: 'CERT-MDO-2026-00215',
        cedula: '402-2394851-9',
        nombre: 'Licda. Carmen Altagracia Pérez',
        rango: 'Agente Capellán (AC)',
        especialidad: 'Capellanía Penitenciaria y Readaptación',
        jurisdiccion: 'Santiago de los Caballeros / Región Norte',
        pais: 'República Dominicana',
        fechaEmision: '01/03/2026',
        fechaVencimientoCarnet: '01/03/2028',
        fechaVencimientoCert: '01/03/2027',
        estado: 'Activo',
        foto: 'fotos/actividad-capellanes-5.webp',
        iglesia: 'Iglesia de la Gracia y Restauración',
        rangoCodigo: 'AC'
    },
    {
        idCarnet: 'DO-2026-OC-0104-7',
        certCode: 'CERT-MDO-2026-00330',
        cedula: '001-0982345-2',
        nombre: 'Dr. Roberto M. Gómez Peña',
        rango: 'Oficial Capellán (OC)',
        especialidad: 'Capellanía de Derechos Humanos y Mediación',
        jurisdiccion: 'Santo Domingo Este / Provincia Santo Domingo',
        pais: 'República Dominicana',
        fechaEmision: '20/02/2026',
        fechaVencimientoCarnet: '20/02/2028',
        fechaVencimientoCert: '20/02/2027',
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
   3. MÓDULO DE VERIFICACIÓN DE CREDENCIALES Y CERTIFICACIONES OFICIALES
   ========================================================================== */
function initVerifier() {
    const btnSearch = document.getElementById('btnSearchCarnet');
    const inputSearch = document.getElementById('inputSearchCarnet');

    if (!btnSearch || !inputSearch) return;

    btnSearch.addEventListener('click', () => {
        executeVerification(inputSearch.value);
    });

    inputSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executeVerification(inputSearch.value);
    });
}

function executeVerification(rawQuery) {
    const inputSearch = document.getElementById('inputSearchCarnet');
    const resultBox = document.getElementById('verifierResultContainer');
    if (!resultBox) return;

    const query = (rawQuery || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!query) {
        alert('Por favor ingrese el Código de Certificación (Ej: CERT-MDO-2026-00489), ID de Carnet (Ej: DO-2026-OC-0015-9) o Cédula.');
        if (inputSearch) inputSearch.focus();
        return;
    }

    if (inputSearch) inputSearch.value = rawQuery;

    // Search in registry
    let found = CAPELLANES_REGISTRY.find(c => 
        (c.certCode && c.certCode.toUpperCase().replace(/[^A-Z0-9]/g, '') === query.replace(/[^A-Z0-9]/g, '')) ||
        (c.idCarnet && c.idCarnet.toUpperCase().replace(/[^A-Z0-9]/g, '') === query.replace(/[^A-Z0-9]/g, '')) ||
        (c.cedula && c.cedula.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, ''))
    );

    if (!found) {
        // Check local storage applications
        const stored = JSON.parse(localStorage.getItem('micardo_applications') || '[]');
        const fromStorage = stored.find(s => 
            (s.trackingCode && s.trackingCode.toUpperCase() === query) ||
            (s.cedula && s.cedula.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, ''))
        );
        if (fromStorage && fromStorage.status === 'Aprobado') {
            found = {
                idCarnet: fromStorage.idCarnet || `DO-2026-${fromStorage.rangoCode || 'OC'}-9901-5`,
                certCode: `CERT-MDO-2026-${Math.floor(10000 + Math.random() * 90000)}`,
                cedula: fromStorage.cedula,
                nombre: `${fromStorage.nombres} ${fromStorage.apellidos}`,
                rango: fromStorage.rango,
                especialidad: fromStorage.especialidad || 'Capellanía Comunitaria',
                jurisdiccion: `${fromStorage.provincia} / Cobertura Oficial`,
                pais: 'República Dominicana',
                fechaEmision: fromStorage.dateSubmitted || '07/09/2026',
                fechaVencimientoCarnet: '07/09/2028',
                fechaVencimientoCert: '07/09/2027',
                estado: 'Activo',
                foto: 'img/logo-institucional.webp',
                iglesia: fromStorage.iglesia || 'Ministerio Acreditado'
            };
        }
    }

    if (found) {
        trackGA4Event('verificacion_exitosa', { id_carnet: found.idCarnet, cert_code: found.certCode, rango: found.rango });
        renderVerificationSuccess(found, resultBox);
    } else {
        trackGA4Event('verificacion_fallida', { query_buscada: query });
        renderVerificationNotFound(query, resultBox);
    }

    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderVerificationSuccess(c, container) {
    const qrData = encodeURIComponent(`https://capellanesrd-764f8.web.app/?verify=${c.idCarnet}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;

    container.innerHTML = `
        <div class="result-card-official">
            <div class="result-card-header">
                <div class="d-flex align-items-center gap-3">
                    <i class="fa-solid fa-shield-halved text-gold fs-3"></i>
                    <div>
                        <h4 class="m-0 text-white font-heading">Credencial y Certificación Oficial Verificada</h4>
                        <small class="text-light">Registro Nacional de Capellanes M.CA.RD.O. / MICARD</small>
                    </div>
                </div>
                <span class="status-chip status-chip-active">
                    <i class="fa-solid fa-circle-check"></i> ${c.estado}
                </span>
            </div>

            <!-- TABS: VISTA CARNET DIGITAL VS VISTA CERTIFICACIÓN OFICIAL IMPRIMIBLE -->
            <div class="p-3 bg-light border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                <ul class="nav nav-pills" id="verifyTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active fw-bold btn-sm py-2 px-3" id="tab-carnet-btn" data-bs-toggle="pill" data-bs-target="#tab-carnet" type="button" role="tab">
                            <i class="fa-solid fa-id-card me-1"></i> Ficha y Carnet Digital
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link fw-bold btn-sm py-2 px-3 text-dark" id="tab-cert-btn" data-bs-toggle="pill" data-bs-target="#tab-cert" type="button" role="tab">
                            <i class="fa-solid fa-certificate text-gold me-1"></i> Certificación Oficial Imprimible
                        </button>
                    </li>
                </ul>

                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-gold-custom" onclick="printOfficialCertificate('${c.idCarnet}')">
                        <i class="fa-solid fa-print me-1"></i> Imprimir Certificación Oficial
                    </button>
                </div>
            </div>

            <div class="tab-content p-4 bg-white" id="verifyTabContent">
                
                <!-- TAB 1: CARNET DIGITAL & DATOS -->
                <div class="tab-pane fade show active" id="tab-carnet" role="tabpanel">
                    <div class="row align-items-center g-4">
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
                                        <small class="text-muted d-block mt-1" style="font-size: 0.68rem;">VENCE: ${c.fechaVencimientoCarnet}</small>
                                    </div>
                                    <div class="carnet-qr-box">
                                        <img src="${qrUrl}" alt="QR Verificación" style="width: 55px; height: 55px;">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-7">
                            <div class="table-responsive">
                                <table class="table table-borderless align-middle mb-0">
                                    <tbody>
                                        <tr>
                                            <th class="text-muted ps-0" style="width: 38%;">Capellán Titular:</th>
                                            <td class="fw-bold text-navy">${c.nombre}</td>
                                        </tr>
                                        <tr>
                                            <th class="text-muted ps-0">Cédula / Documento:</th>
                                            <td class="fw-bold text-navy">${c.cedula}</td>
                                        </tr>
                                        <tr>
                                            <th class="text-muted ps-0">ID de Carnet Oficial:</th>
                                            <td><span class="badge bg-navy text-gold font-monospace px-3 py-1 fs-6">${c.idCarnet}</span></td>
                                        </tr>
                                        <tr>
                                            <th class="text-muted ps-0">Código Certificación:</th>
                                            <td><span class="badge bg-light text-dark border font-monospace px-2 py-1">${c.certCode}</span></td>
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
                                            <th class="text-muted ps-0">Jurisdicción Asignada:</th>
                                            <td><i class="fa-solid fa-location-dot text-danger me-1"></i> ${c.jurisdiccion}</td>
                                        </tr>
                                        <tr>
                                            <th class="text-muted ps-0">Límite de Vigencia:</th>
                                            <td><span class="text-danger fw-bold">${c.fechaVencimientoCert}</span> (Vigencia 1 Año)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TAB 2: CERTIFICACIÓN OFICIAL COMPLETA PARA IMPRESIÓN / EMBAJADAS -->
                <div class="tab-pane fade" id="tab-cert" role="tabpanel">
                    <div class="certificate-paper p-4" id="certificateVisualDisplay">
                        
                        <!-- Header del Certificado -->
                        <div class="row align-items-center mb-3 pb-3 border-bottom border-gold">
                            <div class="col-2 text-center">
                                <img src="img/logo-institucional.webp" alt="Escudo Oficial" class="certificate-header-logo">
                            </div>
                            <div class="col-10 text-center">
                                <span class="text-gold fw-bold text-uppercase d-block" style="font-size: 0.8rem; letter-spacing: 2px;">REPÚBLICA DOMINICANA</span>
                                <h4 class="fw-bold font-heading text-navy m-0" style="font-size: 1.25rem;">MINISTERIO DE CAPELLANES DE LA REPÚBLICA DOMINICANA</h4>
                                <strong class="text-gold d-block" style="font-size: 0.95rem;">M.CA.RD.O. | MICARD</strong>
                                <small class="text-muted d-block" style="font-size: 0.75rem;">Consejo Superior de Acreditación, Formación y Disciplina Ministerial | Ley No. 122-05</small>
                            </div>
                        </div>

                        <!-- Barra de Metadatos de Seguridad -->
                        <div class="row text-center g-2 bg-light p-2 rounded mb-3 border">
                            <div class="col-sm-3 col-6">
                                <small class="text-muted d-block" style="font-size: 0.68rem;">CÓDIGO CERTIFICACIÓN:</small>
                                <strong class="font-monospace text-navy" style="font-size: 0.8rem;">${c.certCode}</strong>
                            </div>
                            <div class="col-sm-3 col-6">
                                <small class="text-muted d-block" style="font-size: 0.68rem;">ID CARNET OFICIAL:</small>
                                <strong class="font-monospace text-gold" style="font-size: 0.8rem;">${c.idCarnet}</strong>
                            </div>
                            <div class="col-sm-3 col-6">
                                <small class="text-muted d-block" style="font-size: 0.68rem;">FECHA DE EXPEDICIÓN:</small>
                                <strong class="text-dark" style="font-size: 0.8rem;">${c.fechaEmision}</strong>
                            </div>
                            <div class="col-sm-3 col-6">
                                <small class="text-muted d-block" style="font-size: 0.68rem;">FECHA DE VENCIMIENTO:</small>
                                <strong class="text-danger" style="font-size: 0.8rem;">${c.fechaVencimientoCert}</strong>
                            </div>
                        </div>

                        <div class="text-center mb-3">
                            <h5 class="fw-bold text-navy font-heading mb-1" style="font-size: 1.15rem;">CERTIFICADO OFICIAL DE ACREDITACIÓN Y MEMBRESÍA ACTIVA</h5>
                            <span class="badge bg-gold text-dark px-3 py-1 font-monospace" style="font-size: 0.72rem;">DOCUMENTO OFICIAL TEMPORALMENTE LIMITADO (VIGENCIA 1 AÑO)</span>
                        </div>

                        <p class="small text-muted mb-2 text-justify">
                            <strong>A LAS AUTORIDADES CIVILES, JUDICIALES, MILITARES, PENITENCIARIAS, HOSPITALARIAS, CUERPOS DIPLOMÁTICOS, EMBAJADAS Y CONSULADOS EXTRANJEROS:</strong>
                        </p>

                        <p class="small text-muted mb-3 text-justify">
                            El suscrito Consejo Superior de M.CA.RD.O. / MICARD, en ejercicio de sus atribuciones estatutarias y conforme a las leyes de la República Dominicana, hace constar que el ciudadano:
                        </p>

                        <!-- Recuadro del Titular -->
                        <div class="p-3 bg-light rounded-3 border border-secondary text-center mb-3">
                            <span class="text-gold fw-bold small d-block">CAPELLÁN OFICIAL ACREDITADO:</span>
                            <h4 class="fw-bold text-navy font-heading mb-1">${c.nombre}</h4>
                            <div class="text-muted small">
                                <strong>Cédula:</strong> ${c.cedula} | <strong>Rango:</strong> <span class="text-primary fw-bold">${c.rango}</span> | <strong>ID Carnet:</strong> ${c.idCarnet}
                            </div>
                            <div class="text-muted small mt-1">
                                <strong>Especialidad:</strong> ${c.especialidad} | <strong>Jurisdicción:</strong> ${c.jurisdiccion}
                            </div>
                        </div>

                        <!-- Cláusula de Vigencia Limitada -->
                        <div class="alert alert-warning p-2 mb-3 small border-warning">
                            <strong class="text-danger"><i class="fa-solid fa-clock-rotate-left me-1"></i> CLÁUSULA DE VIGENCIA DETERMINADA:</strong>
                            La presente certificación tiene una validez temporal improrrogable de <strong>UN (1) AÑO CALENDARIO</strong>, válida desde el <strong>${c.fechaEmision}</strong> hasta el <strong>${c.fechaVencimientoCert}</strong>. Caducada dicha fecha, el titular deberá gestionar su formal revalidación.
                        </div>

                        <!-- Salvoconducto y QR -->
                        <div class="row align-items-center g-3 mb-4">
                            <div class="col-md-9">
                                <p class="small text-muted m-0 text-justify">
                                    <strong>COOPERACIÓN Y SALVOCONDUCTO DIPLOMÁTICO:</strong> Se solicita respetuosamente a las autoridades nacionales y misiones diplomáticas brindar al portador todas las facilidades y consideraciones en el ejercicio de sus funciones ministeriales y misiones humanitarias.
                                </p>
                                <small class="text-gold fw-bold d-block mt-1">
                                    <i class="fa-solid fa-link me-1"></i> Validación Digital 24/7: https://capellanesrd-764f8.web.app/?verify=${c.idCarnet}
                                </small>
                            </div>
                            <div class="col-md-3 text-center">
                                <img src="${qrUrl}" alt="QR Validación" style="width: 75px; height: 75px; border: 1px solid #C9A227; padding: 2px;">
                                <small class="d-block text-muted" style="font-size: 0.65rem;">QR Autenticidad</small>
                            </div>
                        </div>

                        <!-- Firmas Oficiales y Sello -->
                        <div class="row text-center pt-3 border-top g-3">
                            <div class="col-4">
                                <div class="border-top border-dark pt-1">
                                    <strong class="text-navy small d-block">PASTOR JUAN ESTEBAN</strong>
                                    <small class="text-muted d-block" style="font-size: 0.65rem;">Presidente / Comandante General</small>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="certificate-seal-stamp" style="width: 80px; height: 80px; font-size: 0.6rem;">
                                    <span>★ ★ ★</span>
                                    <span style="font-size: 0.55rem;">SELLO SECO OFICIAL</span>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="border-top border-dark pt-1">
                                    <strong class="text-navy small d-block">DAWRIN URIBE PEÑA</strong>
                                    <small class="text-muted d-block" style="font-size: 0.65rem;">Secretario General y Acreditación</small>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div class="mt-3 text-center no-print">
                        <button class="btn btn-gold-custom px-4" onclick="printOfficialCertificate('${c.idCarnet}')">
                            <i class="fa-solid fa-print me-1"></i> Imprimir Esta Certificación Oficial
                        </button>
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
                        El número ingresado no coincide con una certificación o credencial activa en la base de datos nacional de M.CA.RD.O. o su trámite se encuentra en proceso de validación.
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
   4. FUNCIÓN PARA IMPRIMIR CERTIFICACIÓN OFICIAL (PRINTABLE CERTIFICATE)
   ========================================================================== */
function printOfficialCertificate(idCarnet) {
    const c = CAPELLANES_REGISTRY.find(item => item.idCarnet === idCarnet) || CAPELLANES_REGISTRY[0];
    const printArea = document.getElementById('printableCertificateArea');
    if (!printArea) {
        window.print();
        return;
    }

    const qrData = encodeURIComponent(`https://capellanesrd-764f8.web.app/?verify=${c.idCarnet}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrData}`;

    printArea.innerHTML = `
        <div class="certificate-paper p-5">
            <!-- Header Oficial con Logo -->
            <div class="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-warning">
                <img src="img/logo-institucional.webp" alt="Logo M.CA.RD.O." style="height: 90px;">
                <div class="text-center flex-grow-1 px-3">
                    <span class="text-gold fw-bold text-uppercase d-block" style="font-size: 0.9rem; letter-spacing: 2px;">REPÚBLICA DOMINICANA</span>
                    <h3 class="fw-bold font-heading text-navy m-0" style="font-size: 1.4rem;">MINISTERIO DE CAPELLANES DE LA REPÚBLICA DOMINICANA</h3>
                    <h5 class="text-gold fw-bold m-0" style="font-size: 1.1rem;">M.CA.RD.O.  |  MICARD</h5>
                    <small class="text-muted d-block" style="font-size: 0.8rem;">CONSEJO SUPERIOR DE ACREDITACIÓN, FORMACIÓN Y DISCIPLINA MINISTERIAL</small>
                    <small class="text-muted d-block" style="font-size: 0.72rem;">Personería Jurídica bajo la Ley No. 122-05 | Sede Central: Santo Domingo / San Cristóbal, R.D.</small>
                </div>
            </div>

            <!-- Metadatos de Control -->
            <div class="row text-center g-2 bg-light p-2 rounded mb-4 border border-secondary">
                <div class="col-3">
                    <small class="text-muted d-block" style="font-size: 0.72rem;">CÓDIGO DE CERTIFICACIÓN:</small>
                    <strong class="font-monospace text-navy">${c.certCode}</strong>
                </div>
                <div class="col-3">
                    <small class="text-muted d-block" style="font-size: 0.72rem;">ID CARNET OFICIAL:</small>
                    <strong class="font-monospace text-gold">${c.idCarnet}</strong>
                </div>
                <div class="col-3">
                    <small class="text-muted d-block" style="font-size: 0.72rem;">FECHA DE EXPEDICIÓN:</small>
                    <strong class="text-dark">${c.fechaEmision}</strong>
                </div>
                <div class="col-3">
                    <small class="text-muted d-block" style="font-size: 0.72rem;">FECHA DE VENCIMIENTO:</small>
                    <strong class="text-danger">${c.fechaVencimientoCert}</strong>
                </div>
            </div>

            <div class="text-center mb-4">
                <h4 class="fw-bold text-navy font-heading mb-1">CERTIFICADO OFICIAL DE ACREDITACIÓN Y MEMBRESÍA ACTIVA</h4>
                <span class="badge bg-gold text-dark px-3 py-1 font-monospace">DOCUMENTO OFICIAL TEMPORALMENTE LIMITADO (VIGENCIA 1 AÑO)</span>
            </div>

            <p class="small text-muted mb-2 text-justify">
                <strong>A LAS AUTORIDADES CIVILES, JUDICIALES, MILITARES, POLICIALES, SANITARIAS, PENITENCIARIAS, CUERPOS DIPLOMÁTICOS, EMBAJADAS Y MISIONES CONSULARES:</strong>
            </p>

            <p class="small text-muted mb-3 text-justify">
                El suscrito Consejo Directivo y Superior del MINISTERIO DE CAPELLANES DE LA REPÚBLICA DOMINICANA (M.CA.RD.O. / MICARD), en ejercicio de las facultades legales conferidas por sus estatutos y las leyes dominicanas, certifica de manera formal e inequívoca que:
            </p>

            <!-- Recuadro del Titular -->
            <div class="p-3 bg-light rounded border border-dark text-center mb-3">
                <span class="text-gold fw-bold small d-block">CAPELLÁN OFICIAL ACREDITADO:</span>
                <h3 class="fw-bold text-navy font-heading mb-1">${c.nombre}</h3>
                <div class="text-dark small">
                    <strong>Cédula:</strong> ${c.cedula} | <strong>Rango:</strong> <span class="text-primary fw-bold">${c.rango}</span> | <strong>ID Carnet:</strong> ${c.idCarnet}
                </div>
                <div class="text-muted small mt-1">
                    <strong>Especialidad:</strong> ${c.especialidad} | <strong>Jurisdicción:</strong> ${c.jurisdiccion}
                </div>
            </div>

            <!-- Declaración y Vigencia -->
            <p class="small text-muted mb-2 text-justify">
                1. <strong>MEMBRESÍA ACTIVA:</strong> El titular es miembro activo de pleno derecho, debidamente juramentado y portador de credenciales oficiales vigentes sin registrar sanciones disciplinarias.
            </p>
            <p class="small text-muted mb-3 text-justify">
                2. <strong>FACULTADES MINISTERIALES:</strong> Está legal y pastoralmente facultado para brindar asistencia espiritual, moral, mediación pacífica, acompañamiento humanitario y auxilio en crisis en hospitales, recintos penitenciarios y comunidades.
            </p>

            <div class="alert alert-warning p-2 mb-3 small border-warning">
                <strong class="text-danger">CLÁUSULA DE VIGENCIA DETERMINADA:</strong> La presente certificación tiene una validez temporal estricta de <strong>UN (1) AÑO CALENDARIO</strong>, válida desde el <strong>${c.fechaEmision}</strong> hasta el <strong>${c.fechaVencimientoCert}</strong>. Cumplido este término, caduca automáticamente y deberá ser revalidada ante la Secretaría General.
            </div>

            <!-- Salvoconducto y QR -->
            <div class="row align-items-center g-3 mb-4">
                <div class="col-9">
                    <p class="small text-muted m-0 text-justify">
                        <strong>COOPERACIÓN INSTITUCIONAL Y SALVOCONDUCTO DIPLOMÁTICO:</strong> Se solicita a todas las autoridades nacionales y a las Honorables Misiones Diplomáticas, Embajadas y Consulados Extranjeros brindar al portador las facilidades, libre tránsito y cooperación correspondientes a su investidura.
                    </p>
                    <small class="text-gold fw-bold d-block mt-2">
                        Validación Digital Oficial 24/7: https://capellanesrd-764f8.web.app/?verify=${c.idCarnet}
                    </small>
                </div>
                <div class="col-3 text-center">
                    <img src="${qrUrl}" alt="QR Validación" style="width: 90px; height: 90px; border: 1px solid #C9A227; padding: 2px;">
                    <small class="d-block text-muted" style="font-size: 0.7rem;">QR de Autenticidad</small>
                </div>
            </div>

            <p class="small text-muted text-center mb-4 fst-italic">
                Dado, firmado y sellado en la Sede Central en Santo Domingo / San Cristóbal, República Dominicana, a los ${c.fechaEmision}.
            </p>

            <!-- Firmas y Sello -->
            <div class="row text-center pt-4 border-top g-3">
                <div class="col-4">
                    <div class="border-top border-dark pt-2">
                        <strong class="text-navy small d-block">PASTOR JUAN ESTEBAN</strong>
                        <small class="text-muted d-block" style="font-size: 0.72rem;">Presidente / Comandante General<br>M.CA.RD.O. / MICARD</small>
                    </div>
                </div>
                <div class="col-4">
                    <div class="certificate-seal-stamp">
                        <span>★ ★ ★</span>
                        <span style="font-size: 0.65rem;">SELLO SECO OFICIAL<br>Y TIMBRE HOLOGRÁFICO</span>
                    </div>
                </div>
                <div class="col-4">
                    <div class="border-top border-dark pt-2">
                        <strong class="text-navy small d-block">DAWRIN URIBE PEÑA</strong>
                        <small class="text-muted d-block" style="font-size: 0.72rem;">Secretario General y Acreditación<br>M.CA.RD.O. / MICARD</small>
                    </div>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        window.print();
    }, 200);
}

/* ==========================================================================
   5. AUTO-VERIFICACIÓN MEDIANTE PARÁMETROS URL (?verify=... o ?cert=...)
   ========================================================================== */
function checkUrlQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const verifyCode = params.get('verify') || params.get('cert');
    if (verifyCode) {
        const inputSearch = document.getElementById('inputSearchCarnet');
        if (inputSearch) {
            inputSearch.value = verifyCode;
            executeVerification(verifyCode);
        }
    }
}

/* ==========================================================================
   6. PORTAL DE SOLICITUDES Y REGISTRO (WIZARD MULTI-STEP)
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

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateCurrentStep()) return;

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

        const existing = JSON.parse(localStorage.getItem('micardo_applications') || '[]');
        existing.push(formData);
        localStorage.setItem('micardo_applications', JSON.stringify(existing));

        trackGA4Event('solicitud_enviada', {
            tracking_code: formData.trackingCode,
            rango_solicitado: formData.rangoCode,
            provincia: formData.provincia
        });

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
   7. MÓDULO DE RASTREO DE SOLICITUDES (TRACKER)
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
   8. GALERÍA MULTIMEDIA INTERACTIVA Y LIGHTBOX
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
   9. GOOGLE ANALYTICS 4 (GA4) EVENT TRACKING DISPATCHER
   ========================================================================== */
function initAnalytics() {
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
