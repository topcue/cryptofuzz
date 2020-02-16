var crypto = require('crypto')
var Buffer = require('buffer').Buffer;

var fromHexString = function(hexString) {
    return new Buffer(hexString, 'hex');
}

FuzzerInput = JSON.parse(FuzzerInput);

var toDigestString = function(digestType) {
    if ( IsMD5(digestType) ) {
        return 'md5';
    } else if ( IsSHA1(digestType) ) {
        return 'sha1';
    } else if ( IsSHA224(digestType) ) {
        return 'sha224';
    } else if ( IsSHA256(digestType) ) {
        return 'sha256';
    } else if ( IsSHA384(digestType) ) {
        return 'sha384';
    } else if ( IsSHA512(digestType) ) {
        return 'sha512';
    } else if ( IsRIPEMD160(digestType) ) {
        return 'rmd160';
    }

    throw "Invalid digest type";
}

var OpDigest = function(FuzzerInput) {
    var digestType = parseInt(FuzzerInput['digestType']);
    var cleartext = fromHexString(FuzzerInput['cleartext']);
    var modifier = fromHexString(FuzzerInput['modifier']);

    var digestString;
    try {
        digestString = toDigestString(digestType);
    } catch ( e ) { return; }

    var ret = crypto.createHash(digestString).update(cleartext).digest('hex');
    FuzzerOutput = JSON.stringify(ret);
}

var OpHMAC = function(FuzzerInput) {
    var digestType = parseInt(FuzzerInput['digestType']);
    var cleartext = fromHexString(FuzzerInput['cleartext']);
    var key = fromHexString(FuzzerInput['cipher']['key']);
    var modifier = fromHexString(FuzzerInput['modifier']);

    var digestString;
    try {
        digestString = toDigestString(digestType);
    } catch ( e ) { return; }

    var ret = crypto.createHmac(digestString, key).update(cleartext).digest('hex');
    FuzzerOutput = JSON.stringify(ret);
}

var OpSymmetricEncrypt = function(FuzzerInput) {
    var cleartext = fromHexString(FuzzerInput['cleartext']);
    var cipherType = parseInt(FuzzerInput['cipher']['cipherType']);
    var key = fromHexString(FuzzerInput['cipher']['key']);
    var iv = fromHexString(FuzzerInput['cipher']['iv']);
    var aad = fromHexString(FuzzerInput['aad']);
    var tagSize = parseInt(FuzzerInput['tagSize']);
    
    /* TODO */
}

var OpSymmetricDecrypt = function(FuzzerInput) {
    var ciphertext = fromHexString(FuzzerInput['ciphertext']);
    var cipherType = parseInt(FuzzerInput['cipher']['cipherType']);
    var key = fromHexString(FuzzerInput['cipher']['key']);
    var iv = fromHexString(FuzzerInput['cipher']['iv']);
    var aad = fromHexString(FuzzerInput['aad']);
    var tag = fromHexString(FuzzerInput['tag']);

    /* TODO */
}

var OpKDF_PBKDF2 = function(FuzzerInput) {
    var digestType = parseInt(FuzzerInput['digestType']);
    var iterations = parseInt(FuzzerInput['iterations']);
    var keySize = parseInt(FuzzerInput['keySize']);
    var password = fromHexString(FuzzerInput['password']);
    var salt = fromHexString(FuzzerInput['salt']);
    var modifier = fromHexString(FuzzerInput['modifier']);

    if ( iterations == 0 ) return;

    var digestString;
    try {
        digestString = toDigestString(digestType);
    } catch ( e ) { return; }

    var derivedKey = crypto.pbkdf2Sync(password, salt, iterations, keySize, digestString).toString('hex');

    FuzzerOutput = JSON.stringify(derivedKey);
}

var OpKDF_SCRYPT = function(FuzzerInput) {
    /* not supported by crypto-browserify */
    return;

    var password = fromHexString(FuzzerInput['password']);
    var salt = fromHexString(FuzzerInput['salt']);
    var N = parseInt(FuzzerInput['N']);
    var r = parseInt(FuzzerInput['r']);
    var p = parseInt(FuzzerInput['p']);
    var keySize = parseInt(FuzzerInput['keySize']);
    var modifier = fromHexString(FuzzerInput['modifier']);

    if ( N == 0 || r == 0 || p == 0 ) {
        return;
    }

    crypto.scrypt(password, salt, keySize, { N: N, r : r, p : p }, (err, derivedKey) => {
        if (!err) {
            FuzzerOutput = JSON.stringify(derivedKey.toString('hex'));
        }
    });
}

var operation = parseInt(FuzzerInput['operation']);

if ( IsDigest(operation) ) {
    OpDigest(FuzzerInput);
} else if ( IsHMAC(operation) ) {
    OpHMAC(FuzzerInput);
} else if ( IsSymmetricEncrypt(operation) ) {
    OpSymmetricEncrypt(FuzzerInput);
} else if ( IsSymmetricDecrypt(operation) ) {
    OpSymmetricDecrypt(FuzzerInput);
} else if ( IsKDF_PBKDF2(operation) ) {
    OpKDF_PBKDF2(FuzzerInput);
} else if ( IsKDF_SCRYPT(operation) ) {
    OpKDF_SCRYPT(FuzzerInput);
}
