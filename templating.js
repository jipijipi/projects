String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function formatPhone(number) {
    var formattedPhone = '';
    for (var i = 0; i < 10; i += 2) {
        formattedPhone += number.substring(i, i + 2) + '.';
    }

    return formattedPhone.slice(0, -1);
}

function replaceInTemplate(values, template) {
    var regex = /{{(.+?)}}/g;
    var output = template.replace(regex, function (matched) {
        matched = matched.replace('{{', '');
        matched = matched.replace('}}', '');
        return values[matched];
    });
    return output;
}

function generateCard(template) {
    var configs = {
        sowefund: {
            companyName: 'SOWEFUND',
            primaryColor: '#96bec3',
            secondaryColor: '#A9A9A9',
            tertiaryColor: '#808080',
            companyPhone: '0142405445',
            companyURL: 'https://sowefund.com',
            mailURL: 'http://tiny.cc/sowefund',
            imageURL: 'http://investirstartup.com/signature/signature.png',
            imageMURL: 'http://investirstartup.com/signature/signatureM.gif',
            street: '46 rue Servan',
            city: '75011 Paris',
            tagline: 'Investissement',
        },
        kidioui: {
            companyName: 'KIDIOUI',
            primaryColor: '#19aaca',
            secondaryColor: '#808080',
            tertiaryColor: '#1377ab',
            companyPhone: '0142405445',
            companyURL: 'http://www.kidioui.fr',
            mailURL: 'http://tiny.cc/sowefund',
            imageURL: 'http://investirstartup.com/signature/signature.png',
            imageMURL: 'http://investirstartup.com/signature/signatureM.gif',
            street: '46 rue Servan',
            city: '75011 Paris',
            tagline: 'Voitures',
        },
        sharpn: {
            companyName: 'SHARPN',
            primaryColor: '#36ceaa',
            secondaryColor: '#A9A9A9',
            tertiaryColor: '#808080',
            companyPhone: '0142405445',
            companyURL: 'http://www.sharpn.eu',
            mailURL: 'http://tiny.cc/sowefund',
            street: '13 cité Joly',
            city: '75011 Paris',
            tagline: 'Leveur',
        },
    };

    var form = document.querySelector('form[name=signSowefunK]');
    if (!form.checkValidity()) {
        alert("Merci de remplir les champs obligatoires\nT'as pas de prénom c'est ça ?");
        return;
    }
    var values = configs[document.querySelector('input[name=firm]:checked').value];
    values.firstName = document.querySelector('input[name=prenom]').value.capitalize();
    values.lastName = document.querySelector('input[name=nom]').value.toUpperCase();
    values.cellPhone = document.querySelector('input[name=portable]').value;
    values.firstOccupation = document.querySelector('input[name=poste]').value.capitalize();
    values.secondOccupation = document.querySelector('input[name=poste2]').value.capitalize();
    values.formattedCellPhone = formatPhone(values.cellPhone);
    values.formattedCompanyPhone = formatPhone(values.companyPhone);
    values.cellPhone = '+33' + values.cellPhone.slice(1);
    values.companyPhone = '+33' + values.companyPhone.slice(1);
    var HTMLtemplate = document.querySelector('#' + template).outerHTML;
    var renderedHTML = replaceInTemplate(values, document.querySelector('#' + template).outerHTML);

    var win = window.open(
        '',
        template,
        'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=400, height=200, top=' +
            (screen.height - 400) +
            ', left=' +
            (screen.width - 840)
    );
    win.document.body.innerHTML = renderedHTML;
}
