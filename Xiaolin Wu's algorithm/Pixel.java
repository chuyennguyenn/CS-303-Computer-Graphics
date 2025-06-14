public class Pixel implements Comparable<Pixel> {
    public int x;
    public int y;

    public Pixel(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int compareTo(Pixel other) {
        if (x != other.x)
            return x - other.x;
        return y - other.y;
    }

    public String toString() {
        return "(" + x + ", " + y + ")";
    }
}
