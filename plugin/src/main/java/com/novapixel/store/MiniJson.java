package com.novapixel.store;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Parser JSON mínimo y dependencia-free: solo necesitamos leer las respuestas
 * simples del backend (objetos, arreglos, strings, números y booleanos), no
 * vale la pena empaquetar Gson/Jackson con maven-shade para esto.
 */
final class MiniJson {

    private final String src;
    private int pos;

    private MiniJson(String src) {
        this.src = src;
        this.pos = 0;
    }

    static Object parse(String json) {
        MiniJson parser = new MiniJson(json);
        parser.skipWhitespace();
        Object value = parser.readValue();
        return value;
    }

    private Object readValue() {
        skipWhitespace();
        char c = src.charAt(pos);
        if (c == '{') return readObject();
        if (c == '[') return readArray();
        if (c == '"') return readString();
        if (c == 't' || c == 'f') return readBoolean();
        if (c == 'n') { pos += 4; return null; }
        return readNumber();
    }

    private Map<String, Object> readObject() {
        Map<String, Object> map = new LinkedHashMap<>();
        pos++; // {
        skipWhitespace();
        if (src.charAt(pos) == '}') { pos++; return map; }
        while (true) {
            skipWhitespace();
            String key = readString();
            skipWhitespace();
            pos++; // :
            Object value = readValue();
            map.put(key, value);
            skipWhitespace();
            char c = src.charAt(pos);
            pos++;
            if (c == '}') break;
        }
        return map;
    }

    private List<Object> readArray() {
        List<Object> list = new ArrayList<>();
        pos++; // [
        skipWhitespace();
        if (src.charAt(pos) == ']') { pos++; return list; }
        while (true) {
            Object value = readValue();
            list.add(value);
            skipWhitespace();
            char c = src.charAt(pos);
            pos++;
            if (c == ']') break;
        }
        return list;
    }

    private String readString() {
        StringBuilder sb = new StringBuilder();
        pos++; // opening quote
        while (src.charAt(pos) != '"') {
            char c = src.charAt(pos);
            if (c == '\\') {
                pos++;
                char esc = src.charAt(pos);
                switch (esc) {
                    case 'n': sb.append('\n'); break;
                    case 't': sb.append('\t'); break;
                    case 'r': sb.append('\r'); break;
                    case '"': sb.append('"'); break;
                    case '\\': sb.append('\\'); break;
                    case '/': sb.append('/'); break;
                    case 'u':
                        String hex = src.substring(pos + 1, pos + 5);
                        sb.append((char) Integer.parseInt(hex, 16));
                        pos += 4;
                        break;
                    default: sb.append(esc);
                }
            } else {
                sb.append(c);
            }
            pos++;
        }
        pos++; // closing quote
        return sb.toString();
    }

    private Boolean readBoolean() {
        if (src.startsWith("true", pos)) { pos += 4; return Boolean.TRUE; }
        pos += 5;
        return Boolean.FALSE;
    }

    private Double readNumber() {
        int start = pos;
        while (pos < src.length() && "-+.eE0123456789".indexOf(src.charAt(pos)) >= 0) {
            pos++;
        }
        return Double.parseDouble(src.substring(start, pos));
    }

    private void skipWhitespace() {
        while (pos < src.length() && Character.isWhitespace(src.charAt(pos))) {
            pos++;
        }
    }
}
