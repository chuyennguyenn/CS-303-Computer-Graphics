
//original + how can i fix
import java.util.TreeMap;

public class LineDrawing_int {
    public static TreeMap<Pixel, Double> xuLine(int x0, int y0, int x1, int y1) {
        double gradient;
        int xend, xpxl1, xpxl2, ypxl1, ypxl2;
        double yend, xgap, intery;

        TreeMap<Pixel, Double> retVal = new TreeMap<>();

        boolean steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);

        if (steep) {
            int temp;
            // swap(x0, y0)
            temp = x0;
            x0 = y0;
            y0 = temp;

            // swap(x1, y1)
            temp = x1;
            x1 = y1;
            y1 = temp;
        }

        if (x0 > x1) {
            int temp;

            // swap(x0, x1)
            temp = x0;
            x0 = x1;
            x1 = temp;

            // swap(y0, y1)
            temp = y0;
            y0 = y1;
            y1 = temp;
        }

        double dx = x1 - x0;
        double dy = y1 - y0;

        if (dx == 0) {
            gradient = 1;
        } else
            gradient = dy / dx;

        // 1st end point

        xend = round(x0);
        // dont need to round cause input all integer, xend = x0
        // can remove xend

        yend = y0 + gradient * (xend - x0);
        // since xend = x0, yend = y0 + gradient * 0 = y0
        // can remove yend

        xgap = rfpart(x0 + 0.5);
        // xgap = (x0 + 0.5) - round(x0 + 0.5) = x0 + 0.5 - x0 = 0.5
        // change xgap to 0.5

        xpxl1 = xend;
        // xpxl1 = xend = x0
        // can remove this

        ypxl1 = ipart(yend);
        // yxpl1 = yend = y0
        // can remove this

        if (steep) {
            plot(retVal, new Pixel(ypxl1, xpxl1), rfpart(yend) * xgap);
            // plot(retVal, new Pixel(y0, x0), rfpart(y0) * 0.5);
            // rfpart(y0) = 1

            plot(retVal, new Pixel(ypxl1 + 1, xpxl1), fpart(yend) * xgap);
            // plot(retVal, new Pixel(y0 + 1, x0), fpart(y0) * 0.5);
            // fpart(y0) = 0

        } else {
            plot(retVal, new Pixel(xpxl1, ypxl1), rfpart(yend) * xgap);
            // plot(retVal, new Pixel(x0, y0), rfpart(y0) * 0.5);
            // rfpart(y0) = 1

            plot(retVal, new Pixel(xpxl1, ypxl1 + 1), fpart(yend) * xgap);
            // plot(retVal, new Pixel(x0, y0 + 1), fpart(y0) * 0.5);
            // fpart(y0) = 0

        }
        intery = gradient + yend;
        // intery = gradient + y0;

        // 2nd end point
        // the logic is the same as above

        xend = round(x1);
        // xend = x1

        yend = y1 + gradient * (xend - x1);
        // yend = y1

        xgap = fpart(x1 + 0.5);
        // xgap = 0.5

        xpxl2 = xend;
        // xpxl2 = x1

        ypxl2 = ipart(yend);
        // ypxl2 = y1

        if (steep) {
            plot(retVal, new Pixel(ypxl2, xpxl2), rfpart(yend) * xgap);
            // plot(retVal, new Pixel(y1, x1), rfpart(y1) * 0.5);
            // rfpart(y1) = 1

            plot(retVal, new Pixel(ypxl2 + 1, xpxl2), fpart(yend) * xgap);
            // plot(retVal, new Pixel(y1 + 1, x1), fpart(y1) * 0.5);
            // fpart(y1) = 0

        } else {
            plot(retVal, new Pixel(xpxl2, ypxl2), rfpart(yend) * xgap);
            // plot(retVal, new Pixel(x1, y1), rfpart(y1) * 0.5);
            // rfpart(y1) = 1

            plot(retVal, new Pixel(xpxl2, ypxl2 + 1), fpart(yend) * xgap);
            // plot(retVal, new Pixel(x1, y1 + 1), fpart(y1) * 0.5);
            // fpart(y1) = 0

        }

        if (steep) {
            for (int x = xpxl1 + 1; x <= xpxl2 - 1; x++) {
                plot(retVal, new Pixel(ipart(intery), x), rfpart(intery));
                plot(retVal, new Pixel(ipart(intery) + 1, x), fpart(intery));
                intery = intery + gradient;
            }

            /*
             * for (int x = x0 + 1; x <= x1 - 1; x++){
             * plot(retVal, new Pixel(ipart(intery), x), rfpart(intery));
             * plot(retVal, new Pixel(ipart(intery) + 1, x), fpart(intery));
             * intery = intery + gradient;
             * }
             */

        } else {
            for (int x = xpxl1 + 1; x <= xpxl2 - 1; x++) {
                plot(retVal, new Pixel(x, ipart(intery)), rfpart(intery));
                plot(retVal, new Pixel(x, ipart(intery) + 1), fpart(intery));
                intery = intery + gradient;
            }

            /*
             * for (int x = x0 + 1; x <= x1 - 1; x++){
             * plot(retVal, new Pixel(x, ipart(intery)), rfpart(intery));
             * plot(retVal, new Pixel(x, ipart(intery) + 1), fpart(intery));
             * intery = intery + gradient;
             * }
             */

        }

        return retVal;
    }

    public static TreeMap<Pixel, Double> plot(TreeMap<Pixel, Double> a, Pixel b, double c) {
        if (c != 0) {
            a.put(b, c);
        }
        return a;
    }

    public static int round(double x) { // this can be remove
        return (int) Math.round(x);
    }

    public static int ipart(double x) {
        return (int) Math.floor(x);
    }

    public static double fpart(double x) {
        return x - Math.floor(x);
    }

    public static double rfpart(double x) {
        return 1 - fpart(x);
    }

    public static void main(String[] args) {
        TreeMap<Pixel, Double> answer = LineDrawing.xuLine(0, 0, 3, 6);
        for (Pixel p : answer.keySet()) {
            System.out.println(p + " " + answer.get(p));
        }
    }
}
