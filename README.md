# Custom Webapp pour l'écodevice (GCE)

Ce dépôt contient les sources d'origine de la webapp de [l'écodevice de GCE](http://gce-electronics.com/fr/carte-relais-ethernet-module-rail-din/409-teleinformation-ethernet-ecodevices.html) en version 1.05.25 customisé pour mes besoins.

## Compilation de la webapp

- Ouvrir l'outil MPFS2.exe (Windows uniquement)
- Sélectionnez l'emplacement vers la webapp
- Sélectionnez le type `BIN Image`
- Changer le paramètre `Processing Options > Advanced Settings > Dynamic Files` avec la valeur :
> `*.htm, *.html, *.cgi, *.xml, *.gce, *.csv, *.json`
- Décocher la case `Upload Image To`
- Générer le fichier


## Envoi du fichier sur l'ecodevice

- Aller sur `http://<ip_ecodevice>/mpfsupload.htm`
- Sélectionner le fichier `.bin` précédemment généré
- Cliquer sur `Upload`

## Changelog

### 23/04/2020
- Ajout d'une page /data.json qui propose un format plus lisible des données

